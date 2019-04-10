var mysql = require('mysql');

var cnnCompetencias = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'migueMimo10',
  database: 'competencias'
});

module.exports = cnnCompetencias;
