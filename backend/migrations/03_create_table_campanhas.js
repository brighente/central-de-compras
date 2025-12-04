/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('tb_fornecedor_campanha', (table) => {
      table.bigIncrements('id').primary();
      
      table.bigInteger('id_fornecedor').references('id').inTable('tb_fornecedor').notNullable().onDelete('CASCADE');
      table.bigInteger('id_usuario').references('id').inTable('tb_sistema_usuario').notNullable();
      table.bigInteger('id_conta').references('id').inTable('tb_sistema_conta').notNullable(); // Para manter consistência multi-tenant
      
      table.string('descricao_campanha', 2000).notNullable();
      table.decimal('valor_meta', 10, 2); // Ex: Meta de R$ 5000,00
      table.integer('tempo_duracao_campanha'); // Dias
      table.decimal('valor_atingido', 10, 2).defaultTo(0);
      table.integer('quantidade_meta').defaultTo(0);
      table.integer('quantidade_atingida').defaultTo(0);
      
      table.timestamp('dt_inc').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('tb_fornecedor_campanha');
};