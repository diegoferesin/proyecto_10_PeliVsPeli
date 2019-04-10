var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors'); //--------------------------------------

var ctrlControladorPrincipal = require('./controladores/controladorPrincipal'); //REFERENCIA AL CONTROLADOR

var app = express();

app.use(cors()); //--------------------------------------

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

app.get('/competencias', ctrlControladorPrincipal.listarCompetencias);
app.get('/generos', ctrlControladorPrincipal.listarGeneros);
app.get('/directores', ctrlControladorPrincipal.listarDirectores);
app.get('/actores', ctrlControladorPrincipal.listarActores);
app.post('/competencias', ctrlControladorPrincipal.crearCompetencia);
app.get('/competencias/:id', ctrlControladorPrincipal.listarUnaCompetencia);
app.delete('/competencias/:id', ctrlControladorPrincipal.eliminarCompetencia);
app.put('/competencias/:id', ctrlControladorPrincipal.actualizarCompetencia);
app.post('/competencias/:id/voto', ctrlControladorPrincipal.insertarVoto);
app.delete(
  '/competencias/:id/votos',
  ctrlControladorPrincipal.reiniciarCompetencia
);
app.get('/competencias/:id/peliculas', ctrlControladorPrincipal.buscarOpciones);
app.get(
  '/competencias/:id/resultados',
  ctrlControladorPrincipal.buscarResultados
);

var puerto = '8080';

app.listen(puerto, function() {
  console.log('Escuchando en el puerto ' + puerto);
});

/*
  DESDE EL NAVEGADOR

  http://localhost:8080/competencias
  http://localhost:8080/competencias/1/peliculas

*/
