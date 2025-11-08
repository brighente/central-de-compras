async function createEnums(knex){

    await knex.raw("CREATE TYPE TIPO_PERFIL AS ENUM ('ADMIN', 'LOJA', 'FORNECEDOR')");
    await knex.raw("CREATE TYPE TIPO_CAMPANHA AS ENUM ('VALOR_PEDIDO', 'QTD_PRODUTO')");
    await knex.raw("CREATE TYPE TIPO_STATUS_PEDIDO AS ENUM ('PENDENTE', 'SEPARADO', 'ENVIADO', 'CANCELADO')");
}


exports.up = async function(knex){
    await createEnums(knex);

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
    })

    await knex.schema.createTable('tb_sistema_usuario_perfil', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_usuario').references('id').inTable('tb_sistema_usuario').notNullable();
        table.specificType('perfil', 'TIPO_PERFIL').notNullable();
    });

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

};

exports.down = async function(knex){

        await knex.schema
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