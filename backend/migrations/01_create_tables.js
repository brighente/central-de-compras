async function createEnums(knex){

    await knex.raw("CREATE TYPE TIPO_PERFIL AS ENUM ('ADMIN', 'LOJA', 'FORNECEDOR')");
    await knex.raw("CREATE TYPE TIPO_CAMPANHA AS ENUM ('VALOR_PEDIDO', 'QTD_PRODUTO')");
    await knex.raw("CREATE TYPE TIPO_STATUS_PEDIDO AS ENUM ('PENDENTE', 'SEPARADO', 'ENVIADO', 'CANCELADO')");
}


exports.up = async function(knex){
    await createEnums(knex);

            // ----- Tabelas do sistema ----- //

    await knex.schema.createTable('tb_sistema_conta', (table) => {
        table.bigIncrements('id').primary();
        table.timestamp('dh_inc').notNullable().defaultTo(knex.fn.now());
        table.string('nm_conta').notNullable();
        table.boolean('ativo').notNullable().defaultTo(true);
    });

    await knex.schema.createTable('tb_sistema_usuario', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_conta').references('id').inTable('tb_sistema_conta').notNullable();
        table.string('nome');
        table.string('email').notNullable().unique();
        table.string('senha').notNullable();
        table.boolean('ativo').defaultTo(true);
        table.boolean('deve_trocar_senha').defaultTo(false);
    })

    await knex.schema.createTable('tb_sistema_usuario_perfil', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_usuario').references('id').inTable('tb_sistema_usuario').notNullable();
        table.specificType('perfil', 'TIPO_PERFIL').notNullable();
    });

            // ----- Tabelas de Entidades ----- //

    await knex.schema.createTable('tb_fornecedor', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_conta').references('id').inTable('tb_sistema_conta').notNullable();
        table.bigInteger('id_usuario').references('id').inTable('tb_sistema_usuario').notNullable();
        table.timestamp('dh_inc').notNullable().defaultTo(knex.fn.now());
        table.string('razao_social');
        table.string('nome_fantasia');
        table.string('cnpj').notNullable().unique();
        table.string('email_fornecedor').notNullable();
        table.string('telefone');
        table.boolean('ativo').defaultTo(true)
    });

    await knex.schema.createTable('tb_loja', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_conta').references('id').inTable('tb_sistema_conta').notNullable();
        table.bigInteger('id_usuario').references('id').inTable('tb_sistema_usuario').notNullable();
        table.timestamp('dh_inc').notNullable().defaultTo(knex.fn.now());
        table.string('cnpj').notNullable().unique();
        table.string('nome_fantasia').notNullable();
        table.string('razao_social');
        table.boolean('ativo').defaultTo(true);
    });

    await knex.schema.createTable('tb_loja_endereco', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_loja').references('id').inTable('tb_loja').notNullable();
        table.string('logradouro').notNullable();
        table.string('numero');
        table.string('bairro');
        table.string('cidade');
        table.string('estado', 2).notNullable();
        table.string('cep').notNullable();
    });

            // Tabelas Produtos e Pedidos //

    await knex.schema.createTable('tb_categoria', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_conta').references('id').inTable('tb_sistema_conta').notNullable();
        table.string('nome_categoria').notNullable();
    });

    await knex.schema.createTable('tb_fornecedor_produto', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_fornecedor').references('id').inTable('tb_fornecedor').notNullable();
        table.bigInteger('id_categoria').references('id').inTable('tb_categoria').notNullable();
        table.string('produto').notNullable();
        table.decimal('valor_produto', 10, 2).notNullable();
    });

    await knex.schema.createTable('tb_pedido', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_fornecedor').references('id').inTable('tb_fornecedor').notNullable();
        table.bigInteger('id_loja').references('id').inTable('tb_loja').notNullable();
        table.timestamp('dt_inc').notNullable().defaultTo(knex.fn.now());
        table.specificType('status', 'TIPO_STATUS_PEDIDO').defaultTo('PENDENTE');
        table.decimal('vl_total_pedido', 13, 2).notNullable();
    })

    await knex.schema.createTable('tb_pedido_item', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_pedido').references('id').inTable('tb_pedido').notNullable();
        table.bigInteger('id_produto').references('id').inTable('tb_fornecedor_produto').notNullable();
        table.decimal('quantidade', 15, 3).notNullable();
        table.decimal('valor_unitario_praticado', 10, 2).notNullable();
    });

    await knex.schema.createTable('tb_fornecedor_condicao_estado', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_fornecedor').references('id').inTable('tb_fornecedor').notNullable();
        table.string('estado', 2).notNullable(); // Sigla dos estados
        table.decimal('valor_cashback_percentual', 5, 2).defaultTo(0);
        table.integer('prazo_pagamento_dias').defaultTo(0);
        table.decimal('acrescimo_desconto_unitario_valor', 10, 2).defaultTo(0); // Em caso de desconto o valor é negativo
        table.unique(['id_fornecedor', 'estado']); // Evita que regras sejam duplicadas
    });

    await knex.schema.createTable('tb_loja_cashback', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_loja').references('id').inTable('tb_loja').notNullable();
        table.bigInteger('id_fornecedor').references('id').inTable('tb_fornecedor').notNullable();
        table.bigInteger('id_pedido').references('id').inTable('tb_pedido');
        table.decimal('vl_previsto', 13, 2).notNullable();
        table.decimal('vl_realizado', 13, 2).notNullable();
        table.boolean('pago').defaultTo(false);
        table.timestamp('dt_inc').notNullable().defaultTo(knex.fn.now());
    })

};

exports.down = async function(knex){

        await knex.schema
            .dropTableIfExists('tb_fornecedor_campanha')
            .dropTableIfExists('tb_loja_cashback')
            .dropTableIfExists('tb_fornecedor_condicao_estado')
            .dropTableIfExists('tb_pedido_item')
            .dropTableIfExists('tb_pedido')
            .dropTableIfExists('tb_fornecedor_produto')
            .dropTableIfExists('tb_categoria')
            .dropTableIfExists('tb_loja_endereco')
            .dropTableIfExists('tb_loja')
            .dropTableIfExists('tb_fornecedor')
            .dropTableIfExists('tb_sistema_usuario_perfil')
            .dropTableIfExists('tb_sistema_usuario')
            .dropTableIfExists('tb_sistema_conta');

            await knex.raw('DROP TYPE IF EXISTS TIPO_PERFIL');
            await knex.raw('DROP TYPE IF EXISTS TIPO_CAMPANHA');
            await knex.raw('DROP TYPE IF EXISTS TIPO_STATUS_PEDIDO');
};