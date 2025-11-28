const bcrypt = require('bcryptjs');

exports.seed = async function(knex){
    
    const senhaHash = await bcrypt.hash('admin123', 10);

    const contaExistente = await knex('tb_sistema_conta').where({ nm_conta: 'Administrador Central' }).first();

    let idConta;

    if(!contaExistente){
        const [conta] = await knex('tb_sistema_conta').insert({
            nm_conta: 'Administrador Central',
            ativo: 1,
            dh_inc: new Date()
        }).returning('id');

        idConta = conta.id;
    } else {
        idConta = contaExistente.id;
    }

    const usuarioExistente = await knex('tb_sistema_usuario').where({ email: 'admin@gmail.com' }).first();

    let idUsuario;

    if(!usuarioExistente){
        const [usuario] = await knex('tb_sistema_usuario').insert({
            id_conta: idConta,
            nome: 'Admin Master',
            email: 'admin@gmail.com',
            senha: senhaHash,
            ativo: 1
        }).returning('id');

        idUsuario = usuario.id;

        await knex('tb_sistema_usuario_perfil').insert({
            id_usuario: idUsuario,
            perfil: 'ADMIN'
        });

        console.log('Usuario admin criado');
    } else {
        idUsuario = usuarioExistente.id;
    }
}