module.exports = {
  development: {
    client: 'pg', 
    connection: {
      host: 'localhost',     
      port: 5432,            
      user: 'postgres',      
      password: 'abacate',   
      database: 'centrarDeCompras'  
    },
    migrations: {
      directory: './migrations' 
    },
    seeds: {
      directory: './seeds'
    }
  }
};  