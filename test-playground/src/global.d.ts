type sql = typeof import("@squill/squill");
declare const sql : typeof import("@squill/squill");

type sqlite3 = typeof import("@squill/sqlite3-browser");
declare const sqlite3 : typeof import("@squill/sqlite3-browser");

declare const pool : InstanceType<typeof import("@squill/sqlite3-browser").Pool>;

declare const BigInt : (x : any) => bigint;
