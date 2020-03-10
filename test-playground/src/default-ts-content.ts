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
    .addGenerated(columns => [columns.bio]);

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
});
