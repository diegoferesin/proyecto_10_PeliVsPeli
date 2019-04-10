var cnn = require('../conexiones/conexionbd');

function listarCompetencias(req, res) {
  var sql = 'select * from competencia';
  cnn.query(sql, function(error, resultado, fields) {
    if (error) {
      console.log('Hubo un error al listar competencias', error.message);
      return res.status(500).json(error);
    }

    res.send(resultado);
  });
}

function listarUnaCompetencia(req, res) {
  var id = req.params.id;
  var sql =
    "SELECT c.nombre, g.nombre as 'genero_nombre', a.nombre as 'actor_nombre', d.nombre as 'director_nombre' FROM competencia c LEFT JOIN genero g ON c.idGenero = g.id LEFT JOIN actor a ON c.idActor = a.id LEFT JOIN director d ON c.idDirector = d.id WHERE c.id = " +
    id;

  cnn.query(sql, function(error, resultado, fields) {
    if (error) {
      console.log('Hubo un error al buscar la competencia.', error.message);
      return res.status(500).json(error);
    }
    if (resultado.length == 0) {
      console.log('No existe la competencia.');
      return res.status(404).send('No existe la competencia.');
    }

    var objCompetencias = {
      nombre: resultado[0].nombre,
      genero_nombre: resultado[0].genero_nombre,
      actor_nombre: resultado[0].actor_nombre,
      director_nombre: resultado[0].director_nombre
    };

    res.send(objCompetencias);
  });
}

function buscarOpciones(req, res) {
  //VALIDACION
  var id = req.params.id;
  var sqlValidacion = 'SELECT * FROM competencia WHERE id = ?';

  cnn.query(sqlValidacion, [id], function(error, resultadoValidacion, fields) {
    if (error) {
      console.log(
        'No se pudo comprobar la existencia de la competencia.',
        error.message
      );
      return res
        .status(500)
        .send('No se pudo comprobar la existencia de la competencia.');
    }
    if (Object.keys(resultadoValidacion).length === 0) {
      return res.status(404).send('No existe la competencia.');
    }

    //Si paso la validacion continua haciendo la query
    var sql = 'SELECT id, titulo, poster FROM pelicula';

    //(si hay que agregar parametros)
    if (
      resultadoValidacion[0].idGenero > 0 ||
      resultadoValidacion[0].idDirector > 0 ||
      resultadoValidacion[0].idActor > 0
    ) {
      sql += ' WHERE';
    }

    if (resultadoValidacion[0].idGenero > 0) {
      sql += ' genero_id = ' + resultadoValidacion[0].idGenero + ' AND';
    }
    if (resultadoValidacion[0].idDirector > 0) {
      sql +=
        ' director = ( SELECT nombre FROM director WHERE id = ' +
        resultadoValidacion[0].idDirector +
        ' )' +
        ' AND';
    }
    if (resultadoValidacion[0].idActor > 0) {
      sql +=
        ' id IN ( SELECT pelicula_id FROM actor_pelicula WHERE actor_id = ' +
        resultadoValidacion[0].idActor +
        ' )' +
        ' AND';
    }

    //si se agregaron parametros borrar el AND final
    if (
      resultadoValidacion[0].idGenero > 0 ||
      resultadoValidacion[0].idDirector > 0 ||
      resultadoValidacion[0].idActor > 0
    ) {
      sql = sql.slice(0, sql.length - 4);
    }

    sql += ' ORDER BY rand() LIMIT 2';

    console.log(sql);

    cnn.query(sql, function(error, resultado, fields) {
      if (error) {
        console.log('Hubo un error al buscar las películas', error.message);
        return res.status(500).send('Hubo un error al buscar las películas');
      }

      //SI HAY MENOS DE 2 PELICULAS MOSTRAR MENSAJE
      if (resultado.length < 2) {
        return res
          .status(422)
          .send('No hay suficientes películas de los criterios buscados.');
      }

      //si todo sale bien enviar resultados
      var objPeliculas = {
        peliculas: resultado
      };

      res.send(objPeliculas);
    });
  });
}

function insertarVoto(req, res) {
  var nuevoVoto = req.body; //Obtiene el objeto a insertar del body
  var idPelicula = nuevoVoto.idPelicula;

  var idCompetencia = req.params.id;

  //VERIFICAR SI EXISTE LA PELICULA
  var consultaPelicula = 'SELECT * FROM pelicula WHERE id = ?';

  cnn.query(consultaPelicula, [idPelicula], function(
    errorP,
    resultadosP,
    fieldsP
  ) {
    if (errorP) {
      console.log(
        'Hubo un error al verificar la existencia de la película.',
        errorP.message
      );
      return res
        .status(500)
        .send('Hubo un error al verificar la existencia de la película.');
    }
    if (Object.keys(resultadosP).length === 0) {
      return res.status(404).send('No existe la película.');
    }

    //VERIFICAR SI EXISTE LA COMPETENCIA
    var consultaCompetencia = 'SELECT * FROM competencia WHERE id = ?';

    cnn.query(consultaCompetencia, [idCompetencia], function(
      errorC,
      resultadosC,
      fieldsC
    ) {
      if (errorC) {
        console.log(
          'Hubo un error al verificar la existencia de la competencia.',
          errorC.message
        );
        return res
          .status(500)
          .send('Hubo un error al verificar la existencia de la competencia.');
      }
      if (Object.keys(resultadosC).length === 0) {
        return res.status(404).send('No existe la competencia.');
      }

      //SI EXISTE HACER EL INSERT
      var consulta =
        'INSERT INTO votos (idCompetencia, idPelicula) VALUES (?, ?)';

      cnn.query(consulta, [idCompetencia, idPelicula], function(
        error,
        resultados,
        fields
      ) {
        if (error) {
          console.log('Hubo un error al ingresar el voto.', error.message);
          return res.status(500).send('Hubo un error al ingresar el voto.');
        }

        res.json(resultados.insertId); //en lugar del responder con el status 200 envío el insertId para que se redirija a la pagina de resultados de la competencia
      });
    });
  });
}

function buscarResultados(req, res) {
  //VALIDACION
  var id = req.params.id;
  var nombreCompetencia = '';

  var sqlValidacion = 'SELECT nombre FROM competencia WHERE id = ?';

  cnn.query(sqlValidacion, [id], function(error, resultadoValidacion, fields) {
    if (error) {
      console.log(
        'No se pudo comprobar la existencia de la competencia.',
        error.message
      );
      return res
        .status(500)
        .send('No se pudo comprobar la existencia de la competencia.');
    }
    if (Object.keys(resultadoValidacion).length === 0) {
      return res.status(404).send('No existe la competencia.');
    }

    nombreCompetencia = resultadoValidacion[0].nombre;

    //Si paso la validacion continua haciendo la query
    var sql =
      "SELECT v.idPelicula, p.titulo, p.poster, COUNT(v.idPelicula) AS 'votos' FROM votos v INNER JOIN pelicula p ON p.id = v.idPelicula WHERE v.idCompetencia = ? GROUP BY idPelicula ORDER BY votos DESC LIMIT 0, 3;";

    cnn.query(sql, [id], function(error, resultadoV, fields) {
      if (error) {
        console.log(
          'Hubo un error al buscar los resultados de los votos.',
          error.message
        );
        return res
          .status(500)
          .send('Hubo un error al buscar los resultados de los votos.');
      }

      var objPeliculas = {
        competencia: nombreCompetencia,
        resultados: resultadoV
      };

      res.send(objPeliculas);
    });
  });
}

function crearCompetencia(req, res) {
  var nuevaCompetencia = req.body; //Obtiene el objeto a insertar del body

  var nombreCompetencia = nuevaCompetencia.nombre;
  var idGeneroCompetencia = nuevaCompetencia.genero;
  var idDirectorCompetencia = nuevaCompetencia.director;
  var idActorCompetencia = nuevaCompetencia.actor;

  if (nombreCompetencia.length == 0) {
    return res.status(422).send('Debe ingresar el nombre de la competencia.');
  }

  //INSERT
  var parametros = [];
  var consultaInsertarCompetencia = 'INSERT INTO competencia ( nombre';

  parametros.push(nombreCompetencia);

  //Si el genero es 0, es porque se selecciono "Todos", por lo cual hay que evitar el insert del genero (o sea queda)
  if (idGeneroCompetencia > 0) {
    consultaInsertarCompetencia += ', idGenero';
    parametros.push(idGeneroCompetencia);
  }

  if (idDirectorCompetencia > 0) {
    consultaInsertarCompetencia += ', idDirector';
    parametros.push(idDirectorCompetencia);
  }

  if (idActorCompetencia > 0) {
    consultaInsertarCompetencia += ', idActor';
    parametros.push(idActorCompetencia);
  }

  consultaInsertarCompetencia += ')';

  if (parametros.length > 0) {
    consultaInsertarCompetencia += ' VALUES (';

    for (var i = 0; i < parametros.length; i++) {
      consultaInsertarCompetencia += ' ?,';
    }

    consultaInsertarCompetencia =
      consultaInsertarCompetencia.slice(
        0,
        consultaInsertarCompetencia.length - 1
      ) + ' );';
  } else {
    consultaInsertarCompetencia += ';';
  }

  console.log(consultaInsertarCompetencia);
  console.log(parametros);

  cnn.query(consultaInsertarCompetencia, parametros, function(
    error,
    resultados,
    fields
  ) {
    if (error) {
      console.log('Hubo un error al insertar la competencia.', error.message);
      return res.status(500).send('Hubo un error al insertar la competencia.');
    }

    return res.status(200).send('Competencia creada correctamente.');
  });
}

function reiniciarCompetencia(req, res) {
  var id = req.params.id; //obtiene el id de la url (path param)

  //VALIDAR QUE LA COMPETENCIA EXISTA
  var sqlValidacion = 'SELECT nombre FROM competencia WHERE id = ?';

  cnn.query(sqlValidacion, [id], function(error, resultadoValidacion, fields) {
    if (error) {
      console.log(
        'No se pudo comprobar la existencia de la competencia.',
        error.message
      );
      return res
        .status(500)
        .send('No se pudo comprobar la existencia de la competencia.');
    }
    if (Object.keys(resultadoValidacion).length === 0) {
      return res.status(404).send('No existe la competencia.');
    }

    var consulta = 'DELETE FROM votos WHERE idCompetencia = ?';

    cnn.query(consulta, [id], function(error, resultados, fields) {
      if (error) {
        console.log(
          'Hubo un error al reiniciar la competencia.',
          error.message
        );
        return res
          .status(500)
          .send('Hubo un error al reiniciar la competencia.');
      }

      return res.status(200).send('Reinicio Ok.');
    });
  });
}

function listarGeneros(req, res) {
  var sql = 'select * from genero';
  cnn.query(sql, function(error, resultado, fields) {
    if (error) {
      console.log('Hubo un error al listar los generos', error.message);
      return res.status(500).send('Hubo un error al listar los generos');
    }

    res.send(resultado);
  });
}

function listarDirectores(req, res) {
  var sql = 'select * from director';
  cnn.query(sql, function(error, resultado, fields) {
    if (error) {
      console.log('Hubo un error al listar los directores', error.message);
      return res.status(500).send('Hubo un error al listar los directores');
    }

    res.send(resultado);
  });
}

function listarActores(req, res) {
  var sql = 'select * from actor';
  cnn.query(sql, function(error, resultado, fields) {
    if (error) {
      console.log('Hubo un error al listar los actores', error.message);
      return res.status(500).send('Hubo un error al listar los actores');
    }

    res.send(resultado);
  });
}

function eliminarCompetencia(req, res) {
  var id = req.params.id; //obtiene el id de la url (path param)

  //VALIDAR QUE LA COMPETENCIA EXISTA
  var sqlValidacion = 'SELECT nombre FROM competencia WHERE id = ?';

  cnn.query(sqlValidacion, [id], function(error, resultadoValidacion, fields) {
    if (error) {
      console.log(
        'No se pudo comprobar la existencia de la competencia.',
        error.message
      );
      return res
        .status(500)
        .send('No se pudo comprobar la existencia de la competencia.');
    }
    if (Object.keys(resultadoValidacion).length === 0) {
      return res.status(404).send('No existe la competencia.');
    }

    //ELIMINAR LOS VOTOS
    var consulta = 'DELETE FROM votos WHERE idCompetencia = ' + id + ';';

    cnn.query(consulta, function(error, resultados, fields) {
      if (error) {
        console.log(
          'Hubo un error al eliminar los votos de la competencia.',
          error.message
        );
        return res
          .status(500)
          .send('Hubo un error al eliminar los votos de la competencia.');
      }

      //ELIMINAR LA COMPETENCIA
      var consultaCompetencia =
        'DELETE FROM competencia WHERE id = ' + id + ';';

      cnn.query(consultaCompetencia, function(error, resultados, fields) {
        if (error) {
          console.log(
            'Hubo un error al eliminar la competencia.',
            error.message
          );
          return res
            .status(500)
            .send('Hubo un error al eliminar la competencia.');
        }

        return res.status(200).send('Ok');
      });
    });
  });
}

function actualizarCompetencia(req, res) {
  var id = req.params.id; //obtiene el id de la url (path param)
  var nuevosDatos = req.body; //Obtiene el objeto del body

  //ACTUALIZAR COMPETENCIA
  var consulta = 'UPDATE competencia SET nombre = ? WHERE id = ? ;';

  cnn.query(consulta, [nuevosDatos.nombre, id], function(
    error,
    resultados,
    fields
  ) {
    if (error) {
      console.log(
        'Hubo un error al eliminar los votos de la competencia.',
        error.message
      );
      return res
        .status(500)
        .send('Hubo un error al eliminar los votos de la competencia.');
    }

    return res.status(200).send('Ok');
  });
}

module.exports = {
  listarCompetencias: listarCompetencias,
  listarUnaCompetencia: listarUnaCompetencia,
  buscarOpciones: buscarOpciones,
  insertarVoto: insertarVoto,
  buscarResultados: buscarResultados,
  crearCompetencia: crearCompetencia,
  reiniciarCompetencia: reiniciarCompetencia,
  listarGeneros: listarGeneros,
  listarDirectores: listarDirectores,
  listarActores: listarActores,
  eliminarCompetencia: eliminarCompetencia,
  actualizarCompetencia: actualizarCompetencia
};
