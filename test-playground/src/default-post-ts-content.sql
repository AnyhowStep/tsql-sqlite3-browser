INSERT INTO
    person (name, description)
VALUES
    ('Tom', 'I love to change lightbulbs'),
    ('Dick', 'I love lightbulbs'),
    ('Harry', 'I lightbulbs')
;

SELECT * FROM person;

pragma table_xinfo(person);

SELECT * FROM sqlite_master;
