/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // --------------------------------------------------------
  // 1. CRIAÇÃO DE ENUMS (Tipos personalizados do Postgres)
  // --------------------------------------------------------
  await knex.raw("DROP TYPE IF EXISTS tipo_perfil CASCADE");
  await knex.raw("CREATE TYPE tipo_perfil AS ENUM ('ADMIN', 'LOJA', 'FORNECEDOR')");

  await knex.raw("DROP TYPE IF EXISTS tipo_status_pedido CASCADE");
  await knex.raw("CREATE TYPE tipo_status_pedido AS ENUM ('PENDENTE', 'SEPARADO', 'ENVIADO', 'CANCELADO')");

  await knex.raw("DROP TYPE IF EXISTS tipo_campanha CASCADE");
  await knex.raw("CREATE TYPE tipo_campanha AS ENUM ('VALOR_PEDIDO', 'QTD_PRODUTO')");

  return knex.schema
    // --------------------------------------------------------
    // 2. TABELAS DO SISTEMA (Conta e Usuário)
    // --------------------------------------------------------
    .createTable('tb_sistema_conta', table => {
      table.bigIncrements('id').primary();
      table.timestamp('dh_inc').defaultTo(knex.fn.now()).notNullable();
      table.string('nm_conta', 255).notNullable();
      table.boolean('ativo').defaultTo(true).notNullable();
    })
    .createTable('tb_sistema_usuario', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_conta').unsigned().notNullable()
        .references('id').inTable('tb_sistema_conta').onDelete('CASCADE');
      table.string('nome', 255);
      table.string('email', 255).notNullable().unique();
      table.string('senha', 255).notNullable();
      table.boolean('ativo').defaultTo(true);
      table.boolean('deve_trocar_senha').defaultTo(false);
    })
    .createTable('tb_sistema_usuario_perfil', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_usuario').unsigned().notNullable()
        .references('id').inTable('tb_sistema_usuario').onDelete('CASCADE');
      table.specificType('perfil', 'tipo_perfil').notNullable();
    })

    // --------------------------------------------------------
    // 3. TABELAS PRINCIPAIS (Categoria, Loja, Fornecedor)
    // --------------------------------------------------------
    .createTable('tb_categoria', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_conta').unsigned().notNullable().references('id').inTable('tb_sistema_conta');
      table.string('nome_categoria', 255).notNullable();
    })
    .createTable('tb_loja', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_conta').unsigned().notNullable().references('id').inTable('tb_sistema_conta');
      table.bigInteger('id_usuario').unsigned().notNullable().references('id').inTable('tb_sistema_usuario');
      table.timestamp('dh_inc').defaultTo(knex.fn.now()).notNullable();
      table.string('cnpj', 255).notNullable().unique();
      table.string('nome_fantasia', 255).notNullable();
      table.string('razao_social', 255);
      table.boolean('ativo').defaultTo(true);
    })
    .createTable('tb_fornecedor', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_conta').unsigned().notNullable().references('id').inTable('tb_sistema_conta');
      table.bigInteger('id_usuario').unsigned().notNullable().references('id').inTable('tb_sistema_usuario');
      table.timestamp('dh_inc').defaultTo(knex.fn.now()).notNullable();
      table.string('razao_social', 255);
      table.string('nome_fantasia', 255);
      table.string('cnpj', 255).notNullable().unique();
      table.string('email_fornecedor', 255).notNullable();
      table.string('telefone', 255);
      table.boolean('ativo').defaultTo(true);
    })

    // --------------------------------------------------------
    // 4. DETALHES (Endereços e Configurações)
    // --------------------------------------------------------
    .createTable('tb_loja_endereco', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_loja').unsigned().notNullable()
        .references('id').inTable('tb_loja').onDelete('CASCADE');
      table.string('logradouro', 255).notNullable();
      table.string('numero', 255);
      table.string('bairro', 255);
      table.string('cidade', 255);
      table.string('estado', 2).notNullable();
      table.string('cep', 255).notNullable();
    })
    .createTable('tb_loja_contato', table => {
      table.increments('id').primary();
      table.bigInteger('id_loja').unsigned().notNullable()
        .references('id').inTable('tb_loja').onDelete('CASCADE');
      table.string('nome', 255).notNullable();
      table.string('cargo', 100);
      table.string('email', 255);
      table.string('telefone', 20);
      table.timestamp('dt_inc').defaultTo(knex.fn.now());
    })
    .createTable('tb_fornecedor_endereco', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_fornecedor').unsigned().notNullable()
        .references('id').inTable('tb_fornecedor').onDelete('CASCADE');
      table.string('logradouro', 255).notNullable();
      table.string('numero', 255);
      table.string('bairro', 255);
      table.string('cidade', 255);
      table.string('estado', 2);
      table.string('cep', 255);
      table.timestamp('dt_inc').defaultTo(knex.fn.now());
    })
    .createTable('tb_fornecedor_condicao_pagamento', table => {
      table.increments('id').primary(); // Mantendo integer conforme seus scripts
      table.integer('id_fornecedor').notNullable(); 
      table.string('descricao', 255).notNullable();
      table.timestamp('dt_inc').defaultTo(knex.fn.now());
    })
    .createTable('tb_fornecedor_condicao_estado', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_fornecedor').unsigned().notNullable().references('id').inTable('tb_fornecedor');
      table.string('estado', 2).notNullable();
      table.decimal('valor_cashback_percentual', 5, 2).defaultTo(0);
      table.integer('prazo_pagamento_dias').defaultTo(0);
      table.decimal('acrescimo_desconto_unitario_valor', 10, 2).defaultTo(0);
      table.unique(['id_fornecedor', 'estado']);
    })
    .createTable('tb_fornecedor_campanha', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_fornecedor').unsigned().notNullable()
        .references('id').inTable('tb_fornecedor').onDelete('CASCADE');
      table.bigInteger('id_usuario').unsigned().notNullable().references('id').inTable('tb_sistema_usuario');
      table.bigInteger('id_conta').unsigned().notNullable().references('id').inTable('tb_sistema_conta');
      table.string('descricao_campanha', 2000).notNullable();
      table.decimal('valor_meta', 10, 2);
      table.integer('tempo_duracao_campanha');
      table.decimal('valor_atingido', 10, 2).defaultTo(0);
      table.integer('quantidade_meta').defaultTo(0);
      table.integer('quantidade_atingida').defaultTo(0);
      table.timestamp('dt_inc').defaultTo(knex.fn.now());
      table.decimal('percentual_desconto', 5, 2);
      table.specificType('tipo_regra', 'tipo_campanha').defaultTo('VALOR_PEDIDO');
    })

    // --------------------------------------------------------
    // 5. PRODUTOS, PEDIDOS E MOVIMENTAÇÃO
    // --------------------------------------------------------
    .createTable('tb_fornecedor_produto', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_fornecedor').unsigned().notNullable().references('id').inTable('tb_fornecedor');
      table.bigInteger('id_categoria').unsigned().notNullable().references('id').inTable('tb_categoria');
      table.string('produto', 255).notNullable();
      table.decimal('valor_produto', 10, 2).notNullable();
      table.string('imagem', 255);
    })
    .createTable('tb_pedido', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_fornecedor').unsigned().notNullable().references('id').inTable('tb_fornecedor');
      table.bigInteger('id_loja').unsigned().notNullable().references('id').inTable('tb_loja');
      table.timestamp('dt_inc').defaultTo(knex.fn.now()).notNullable();
      table.specificType('status', 'tipo_status_pedido').defaultTo('PENDENTE');
      table.decimal('vl_total_pedido', 13, 2).notNullable();
    })
    .createTable('tb_pedido_item', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_pedido').unsigned().notNullable().references('id').inTable('tb_pedido');
      table.bigInteger('id_produto').unsigned().notNullable().references('id').inTable('tb_fornecedor_produto');
      table.decimal('quantidade', 15, 3).notNullable();
      table.decimal('valor_unitario_praticado', 10, 2).notNullable();
    })
    .createTable('tb_loja_cashback', table => {
      table.bigIncrements('id').primary();
      table.bigInteger('id_loja').unsigned().notNullable().references('id').inTable('tb_loja');
      table.bigInteger('id_fornecedor').unsigned().notNullable().references('id').inTable('tb_fornecedor');
      table.bigInteger('id_pedido').unsigned().references('id').inTable('tb_pedido');
      table.decimal('vl_previsto', 13, 2).notNullable();
      table.decimal('vl_realizado', 13, 2).notNullable();
      table.boolean('pago').defaultTo(false);
      table.timestamp('dt_inc').defaultTo(knex.fn.now()).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Ordem reversa EXATA para evitar erro de chave estrangeira ao desfazer
  await knex.schema.dropTableIfExists('tb_loja_cashback');
  await knex.schema.dropTableIfExists('tb_pedido_item');
  await knex.schema.dropTableIfExists('tb_pedido');
  await knex.schema.dropTableIfExists('tb_fornecedor_produto');
  await knex.schema.dropTableIfExists('tb_fornecedor_campanha');
  await knex.schema.dropTableIfExists('tb_fornecedor_condicao_estado');
  await knex.schema.dropTableIfExists('tb_fornecedor_condicao_pagamento');
  await knex.schema.dropTableIfExists('tb_fornecedor_endereco');
  await knex.schema.dropTableIfExists('tb_loja_contato');
  await knex.schema.dropTableIfExists('tb_loja_endereco');
  await knex.schema.dropTableIfExists('tb_fornecedor');
  await knex.schema.dropTableIfExists('tb_loja');
  await knex.schema.dropTableIfExists('tb_categoria');
  await knex.schema.dropTableIfExists('tb_sistema_usuario_perfil');
  await knex.schema.dropTableIfExists('tb_sistema_usuario');
  await knex.schema.dropTableIfExists('tb_sistema_conta');

  // Remove os tipos
  await knex.raw("DROP TYPE IF EXISTS tipo_campanha");
  await knex.raw("DROP TYPE IF EXISTS tipo_status_pedido");
  await knex.raw("DROP TYPE IF EXISTS tipo_perfil");
};