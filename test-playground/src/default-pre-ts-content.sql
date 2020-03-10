SELECT 1e999, -1e999, 1e308, 1308, true, false, null, 'hi', x'123456';

DROP TABLE IF EXISTS person;
CREATE TABLE person (
    personId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2048) NOT NULL,
    bio VARCHAR(9001) NOT NULL AS ('Hi, my name is ' || name || '. ' || description)
);
