const bcrypt = require('bcryptjs'); // Chama o bcrypt

exports.seed = async function(knex){

    await knex('tb_fornecedor').del();
    await knex('tb_sistema_usuario_perfil').del();
    await knex('tb_sistema_usuario').del();
    await knex('tb_sistema_conta').del();

    const [conta] = await knex('tb_sistema_conta').insert([
        {nm_conta: 'Conta Principal'}
    ]).returning('id');
    const idConta = conta.id;

    const senhaHash = await bcrypt.hash('123', 10) // Criptografamos a nossa senha falsa

    const [userFornecedor1] = await knex('tb_sistema_usuario').insert([
        { id_conta: idConta, email: 'user1teste@gmail.com', senha: senhaHash} // Inserindo fornecedor com a senha criptografada
    ]).returning('id');

    const [userFornecedor2] = await knex('tb_sistema_usuario').insert([
        { id_conta: idConta, email: 'user2teste@gmail.com', senha: senhaHash} // Inserindo fornecedor com a senha criptografada
    ]).returning('id');

    await knex('tb_sistema_usuario_perfil').insert([
        { id_usuario: userFornecedor1.id, perfil: 'FORNECEDOR'},
        { id_usuario: userFornecedor2.id, perfil: 'FORNECEDOR'}
    ]);

    await knex('tb_fornecedor').insert([
        {
            id_conta: idConta,
            id_usuario: userFornecedor1.id,
            nome_fantasia: 'Fornecedor Teste 1',
            cnpj: '123456789/0001-01',
            email_fornecedor: 'teste1fornecedor@gmail.com'
        },
        {
            id_conta: idConta,
            id_usuario: userFornecedor2.id,
            nome_fantasia: 'Distribuidora XYZ',
            cnpj: '987654321/0001-02',
            email_fornecedor: 'teste2fornecedor@gmail.com'
        }
    ]);
}