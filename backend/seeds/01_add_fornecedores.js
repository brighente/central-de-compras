const bcrypt = require('bcryptjs'); // Chama o bcrypt

exports.seed = async function(knex){

    await knex('tb_pedido_item').del();
    await knex('tb_pedido').del();
    await knex('tb_fornecedor_produto').del();
    await knex('tb_categoria').del();
    await knex('tb_loja_endereco').del();
    await knex('tb_loja').del();
    await knex('tb_fornecedor').del();
    await knex('tb_sistema_usuario_perfil').del();
    await knex('tb_sistema_usuario').del();
    await knex('tb_sistema_conta').del();

    const [conta] = await knex('tb_sistema_conta').insert([
        {nm_conta: 'Conta Principal'}
    ]).returning('id');
    const idConta = conta.id;

    const senhaHash = await bcrypt.hash('123', 10) // Criptografa a senha falsa

    const [userFornecedor] = await knex('tb_sistema_usuario').insert([
        { id_conta: idConta, email: 'fornecedor@gmail.com', senha: senhaHash} // Inserindo fornecedor com a senha criptografada
    ]).returning('id');

    const [userLoja] = await knex('tb_sistema_usuario').insert([
        { id_conta: idConta, email: 'loja@gmail.com', senha: senhaHash} // Inserindo loja com a senha criptografada
    ]).returning('id');

    await knex('tb_sistema_usuario_perfil').insert([
        { id_usuario: userFornecedor.id, perfil: 'FORNECEDOR'},
        { id_usuario: userLoja.id, perfil: 'LOJA'}
    ]);

    const [fornecedor] = await knex('tb_fornecedor').insert([
        {
            id_conta: idConta,
            id_usuario: userFornecedor.id,
            nome_fantasia: 'Fornecedor Macrovita',
            cnpj: '111111/0001-01',
            email_fornecedor: 'macrovita@gmail.com'
        }
    ]).returning('id');
    const idFornecedor = fornecedor.id;

    const [loja] = await knex('tb_loja').insert([
        {
            id_conta: idConta,
            id_usuario: userLoja.id,
            cnpj: '222222/0001-02',
            nome_fantasia: 'Bar do Janga'
        }
    ]).returning('id');
    const idLoja = loja.id;

    const [categoria] = await knex('tb_categoria').insert([
        {
            id_conta: idConta,
            nome_categoria: 'Bebidas'
        }
    ]).returning('id');
    const idCategoria = categoria.id;

    const [produto] = await knex('tb_fornecedor_produto').insert([
        {
            id_fornecedor: idFornecedor,
            id_categoria: idCategoria,
            produto: 'Macrovita Laranja 2L',
            valor_produto: 7.00
        }
    ]).returning('id');
    const idProduto = produto.id;

    const [pedido] = await knex('tb_pedido').insert([
        {
            id_fornecedor: idFornecedor,
            id_loja: idLoja,
            vl_total_pedido: 50.00
        }
    ]).returning('id');
    const idPedido = pedido.id;

    await knex('tb_pedido_item').insert([
        {
            id_pedido: idPedido,
            id_produto: idProduto,
            quantidade: 10,
            valor_unitario_praticado: 7.00
        }
    ]);

    const [pedido2] = await knex('tb_pedido').insert([
        {
            id_fornecedor: idFornecedor,
            id_loja: idLoja,
            vl_total_pedido: 140,
            status: 'ENVIADO'
        }
    ]).returning('id');
    const idPedido2 = pedido2.id;

    await knex('tb_pedido_item').insert([
        {
            id_pedido: idPedido2,
            id_produto: idProduto,
            quantidade: 20,
            valor_unitario_praticado: 7.00
        }
    ]);

    await knex('tb_loja_endereco').insert([{
        id_loja: idLoja,
        logradouro: 'Rua Marechal Abacate',
        estado: 'SC',
        cep: '88750-000'
    }]);
}