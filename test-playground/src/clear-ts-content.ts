/*
    All of this is accessible globally in this Playground.

    import * as sql from "@squill/squill";
    import * as sqlite3 from "@squill/sqlite3-browser";
    declare const pool : sqite3.Pool;
*/
pool.acquire(async (connection) => {
    //Place all database calls inside here

});
