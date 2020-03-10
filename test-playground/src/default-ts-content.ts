/*
    All of this is accessible globally in this Playground.

    import * as sql from "@squill/squill";
    import * as sqlite3 from "@squill/sqlite3-browser";
    declare const pool : sqite3.Pool;
*/
const person = sql.table("person")
    .addColumns({
        personId : sql.dtBigIntSigned(),
        name : sql.dtVarChar(255),
        description : sql.dtVarChar(2048),
        bio : sql.dtVarChar(9001),
    })
    .setAutoIncrement(columns => columns.personId)
    //Tells us `bio` is a GENERATED column
    .addGenerated(columns => [columns.bio])
    //Tells us that all columns (except generated and auto-increment) may be updated
    .addAllMutable();

pool.acquire(async (connection) => {
    //Place all database calls inside here
    const me = await person.insertAndFetch(
        connection,
        {
            name : sql.concat(
                "TS",
                sql.coalesce(
                    sql.unsafeCastAsVarChar(
                        sql.integer.randomBigIntSigned()
                    ),
                    ""
                )
            ),
            description : sql.concat(
                "Type safety is hard!"
            ),
        }
    );
    console.log(me);

    await person.insertMany(
        connection,
        [
            {
                name : "Kitty",
                description : "I love naps!"
            },
            {
                name : "Shiba",
                description : "I'm a mame shiba but don't look down on me!"
            },
            {
                name : "Red",
                description : "I wanna' be the very best!"
            },
        ]
    );

    //We can build a query without executing it
    const peopleNamedWithLetterIQuery = sql.from(person)
        .where(columns => sql.like(columns.name, "%i%", "\\"))
        .select(columns => [
            //Same as `SELECT *`
            columns,
            //We can SELECT an aliased expression
            sql.concat(
                "Introduction is ",
                //Sometimes, casting returns `NULL`.
                //We use `throwIfNull()` to remove potential nulls during compile-time,
                //in exchange for potential throws during run-time.
                sql.throwIfNull(sql.unsafeCastAsVarChar(
                    sql.charLength(columns.description)
                )),
                " characters long"
            ).as("descriptionMeta"),
        ])
        .orderBy(columns =>[
            columns.person.name.asc(),
        ]);

    await peopleNamedWithLetterIQuery
        .fetchAll(connection)
        .then(console.log);

    await person
        .whereEqPrimaryKey({
            personId : BigInt(2),
        })
        .updateOne(
            connection,
            columns => {
                return {
                    name : sql.concat("Ms ", sql.replace(columns.name, "i", "")),
                };
            }
        );

    //We may execute a previously built query multiple times
    await peopleNamedWithLetterIQuery
        .fetchAll(connection)
        .then(console.log);

});
