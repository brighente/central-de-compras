const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    await knex.raw(`
        TRUNCATE TABLE 
            tb_loja_cashback, tb_pedido_item, tb_pedido, tb_fornecedor_campanha,
            tb_fornecedor_produto, tb_fornecedor_endereco, tb_fornecedor_condicao_estado,
            tb_fornecedor_condicao_pagamento, tb_categoria, 
            tb_loja_contato, tb_loja_endereco, tb_loja, 
            tb_fornecedor, tb_sistema_usuario_perfil, tb_sistema_usuario, tb_sistema_conta
        RESTART IDENTITY CASCADE
    `);

    const senhaHash = await bcrypt.hash('123456', 10);

    const [contaAdmin] = await knex('tb_sistema_conta').insert({
        nm_conta: 'Administrador Central',
        ativo: true
    }).returning('id');

    const [userAdmin] = await knex('tb_sistema_usuario').insert({
        id_conta: contaAdmin.id,
        nome: 'Admin Master',
        email: 'admin@gmail.com',
        senha: senhaHash,
        ativo: true
    }).returning('id');

    await knex('tb_sistema_usuario_perfil').insert({
        id_usuario: userAdmin.id,
        perfil: 'ADMIN'
    });

    console.log('--- Admin criado ---');

    const [contaPrincipal] = await knex('tb_sistema_conta').insert({
        nm_conta: 'Conta Principal'
    }).returning('id');
    
    const [userFornecedor] = await knex('tb_sistema_usuario').insert({
        id_conta: contaPrincipal.id, email: 'fornecedor@gmail.com', senha: senhaHash
    }).returning('id');

    const [userLoja] = await knex('tb_sistema_usuario').insert({
        id_conta: contaPrincipal.id, email: 'loja@gmail.com', senha: senhaHash
    }).returning('id');

    await knex('tb_sistema_usuario_perfil').insert([
        { id_usuario: userFornecedor.id, perfil: 'FORNECEDOR'},
        { id_usuario: userLoja.id, perfil: 'LOJA'}
    ]);

    const [fornecedor] = await knex('tb_fornecedor').insert({
        id_conta: contaPrincipal.id,
        id_usuario: userFornecedor.id,
        nome_fantasia: 'Fornecedor Cimento',
        razao_social: 'Cimento S.A.',
        cnpj: '11.111.111/0001-01',
        email_fornecedor: 'cimento@gmail.com'
    }).returning('id');

    const [loja] = await knex('tb_loja').insert({
        id_conta: contaPrincipal.id,
        id_usuario: userLoja.id,
        cnpj: '22.222.222/0001-02',
        nome_fantasia: 'MC Materiais de Construção',
        razao_social: 'MC Construções LTDA'
    }).returning('id');

    await knex('tb_fornecedor_endereco').insert({
        id_fornecedor: fornecedor.id,
        logradouro: 'Rua Sete de Setembro', numero: '1234', bairro: 'Centro',
        cidade: 'Criciuma', estado: 'SC', cep: '88820-000'
    });

    await knex('tb_loja_endereco').insert({
        id_loja: loja.id,
        logradouro: 'Rua Marechal Jurandir', numero: '1414', bairro: 'Centro',
        cidade: 'Braço do Norte', estado: 'SC', cep: '88820-000'
    });

    const categoriasLista = [
        'Matériais Básicos', 'Elétrica', 'Hidráulica', 'Pisos e Revestimentos',
        'Tintas e Acessórios', 'Ferramentas', 'Iluminação'
    ];
    
    const idsCategorias = await knex('tb_categoria')
        .insert(categoriasLista.map(nome => ({ id_conta: contaPrincipal.id, nome_categoria: nome })))
        .returning(['id', 'nome_categoria']);
    
    const idCatBasicos = idsCategorias.find(c => c.nome_categoria === 'Matériais Básicos').id;

    const [produto] = await knex('tb_fornecedor_produto').insert({
        id_fornecedor: fornecedor.id,
        id_categoria: idCatBasicos,
        produto: 'Cimento Votoran',
        valor_produto: 20.00
    }).returning('id');

    const [pedido1] = await knex('tb_pedido').insert({
        id_fornecedor: fornecedor.id,
        id_loja: loja.id,
        vl_total_pedido: 80.00,
        status: 'PENDENTE'
    }).returning('id');

    await knex('tb_pedido_item').insert({
        id_pedido: pedido1.id, id_produto: produto.id, quantidade: 10, valor_unitario_praticado: 7.00
    });

    const [pedido2] = await knex('tb_pedido').insert({
        id_fornecedor: fornecedor.id,
        id_loja: loja.id,
        vl_total_pedido: 140.00,
    }).returning('id');

    await knex('tb_pedido_item').insert({
        id_pedido: pedido2.id, id_produto: produto.id, quantidade: 20, valor_unitario_praticado: 7.00
    });
    
    const lojasExtras = [
        { email: 'loja2@gmail.com', nome: 'João Materiais', cnpj: '33.333.333/0001-33', cidade: 'Florianópolis' },
        { email: 'loja3@gmail.com', nome: 'Maria Construção', cnpj: '44.444.444/0001-44', cidade: 'São Paulo' },
        { email: 'loja4@gmail.com', nome: 'Pedro Reformas', cnpj: '55.555.555/0001-55', cidade: 'Curitiba' }
    ];

    for (const item of lojasExtras) {
        const [c] = await knex('tb_sistema_conta').insert({ nm_conta: item.nome }).returning('id');
        const [u] = await knex('tb_sistema_usuario').insert({ id_conta: c.id, email: item.email, senha: senhaHash }).returning('id');
        await knex('tb_sistema_usuario_perfil').insert({ id_usuario: u.id, perfil: 'LOJA' });
        
        const [l] = await knex('tb_loja').insert({
            id_conta: c.id, id_usuario: u.id, cnpj: item.cnpj, nome_fantasia: item.nome, razao_social: item.nome + ' Ltda'
        }).returning('id');

        await knex('tb_loja_endereco').insert({
            id_loja: l.id, logradouro: 'Rua Exemplo', numero: '100', bairro: 'Centro', cidade: item.cidade, estado: 'SC', cep: '88000-000'
        });
    }

    const fornsExtras = [
        { email: 'forn2@gmail.com', nome: 'Tintas Brasil', cnpj: '66.666.666/0001-66', cidade: 'São José' },
        { email: 'forn3@gmail.com', nome: 'Fios & Cabos', cnpj: '77.777.777/0001-77', cidade: 'Palhoça' }
    ];

    for (const item of fornsExtras) {
        const [c] = await knex('tb_sistema_conta').insert({ nm_conta: item.nome }).returning('id');
        const [u] = await knex('tb_sistema_usuario').insert({ id_conta: c.id, email: item.email, senha: senhaHash }).returning('id');
        await knex('tb_sistema_usuario_perfil').insert({ id_usuario: u.id, perfil: 'FORNECEDOR' });
        
        const [f] = await knex('tb_fornecedor').insert({
            id_conta: c.id, id_usuario: u.id, cnpj: item.cnpj, nome_fantasia: item.nome, 
            razao_social: item.nome + ' Indústria', email_fornecedor: item.email
        }).returning('id');

        await knex('tb_fornecedor_endereco').insert({
            id_fornecedor: f.id, logradouro: 'Distrito Industrial', numero: '500', bairro: 'Industrial', cidade: item.cidade, estado: 'SC', cep: '88000-000'
        });
    }
};