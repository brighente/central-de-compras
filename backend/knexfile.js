module.exports = {
  development: {
    client: 'pg', // 'pg' é o driver do postgresql
    connection: {
      host: 'localhost',     // Onde seu banco está (provavelmente localhost)
      port: 5432,            // Porta padrão do Postgres
      user: 'postgres',      // SEU USUÁRIO do Postgres
      password: 'abacate',     // SUA SENHA do Postgres
      database: 'centrarDeCompras'  // O NOME DO BANCO que você criou
    },
    migrations: {
      directory: './migrations' // Diz ao Knex onde criar a pasta de migrations
    },
    seeds: {
      directory: './seeds' // Diz ao Knex onde criar a pasta de seeds
    }
  }
};  