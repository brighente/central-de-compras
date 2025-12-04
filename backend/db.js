const knexConfig = require('./knexfile').development; // Pega a config do banco
const knex = require('knex')(knexConfig); // Inicializa o Knex

module.exports = knex;