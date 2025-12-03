/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

    await knex.schema.createTable('tb_fornecedor_endereco', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('id_fornecedor').references('id').inTable('tb_fornecedor').onDelete('CASCADE').notNullable();
        table.string('logradouro').notNullable();
        table.string('numero');
        table.string('bairro');
        table.string('cidade');
        table.string('estado', 2);
        table.string('cep');
        table.timestamp('dt_inc').defaultTo(knex.fn.now());
    });

    const temCategoria = await knex.schema.hasTable('tb_categoria');

    if (!temCategoria) {
        await knex.schema.createTable('tb_categoria', (table) => {
            table.bigIncrements('id').primary();
            table.bigInteger('id_conta').nullable();
            table.string('nome_categoria').notNullable();
        });
    
        await knex('tb_categoria').insert([
            { nome_categoria: 'Cimento e Argamassa' },
            { nome_categoria: 'Pisos e Revestimentos' },
            { nome_categoria: 'Tintas e Acessórios' },
            { nome_categoria: 'Material Elétrico' },
            { nome_categoria: 'Hidráulica' },
            { nome_categoria: 'Ferramentas' }
        ]);
    }
}

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('tb_fornecedor_endereco');
}