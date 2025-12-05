/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  
  // 1. Primeiro, buscamos a conta que foi criada no arquivo 01
  const conta = await knex('tb_sistema_conta')
      .where('nm_conta', 'Conta Principal')
      .first();

  if (!conta) {
      console.error("ERRO: Conta Principal não encontrada. Rode o seed 01 primeiro.");
      return;
  }

  const idConta = conta.id;

  // 2. Agora inserimos as categorias usando o idConta recuperado
  // Dica: Usar .map deixa o código mais limpo para não repetir id_conta toda hora
  const categorias = [
      'Elétrica',
      'Hidráulica',
      'Pisos e Revestimentos',
      'Tintas e Acessórios',
      'Ferramentas',
      'Iluminação',
      'Ferragens',
      'Portas e Janelas',
      'Banheiro e Cozinha'
  ];

  // Transforma a lista de nomes em objetos com id_conta
  const dadosParaInserir = categorias.map(nome => ({
      id_conta: idConta,
      nome_categoria: nome
  }));

  await knex('tb_categoria').insert(dadosParaInserir);
};