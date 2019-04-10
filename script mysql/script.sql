use competencias;



CREATE TABLE competencia
(
    id INT NOT NULL auto_increment,
    nombre VARCHAR(1000),
    idGenero INT UNSIGNED,
    idDirector INT UNSIGNED,
    idActor INT UNSIGNED,
    
    PRIMARY KEY(id),
    FOREIGN KEY (idGenero) REFERENCES genero(id),
    FOREIGN KEY (idDirector) REFERENCES director(id),
    FOREIGN KEY (idActor) REFERENCES actor(id)
);



CREATE TABLE votos
(
    id INT NOT NULL auto_increment,
    idCompetencia INT NOT NULL,
    idPelicula INT UNSIGNED NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (idCompetencia) REFERENCES competencia(id),
    FOREIGN KEY (idPelicula) REFERENCES pelicula(id)
);


