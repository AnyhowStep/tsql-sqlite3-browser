import * as squill from "@squill/squill";
import {tryFetchTableMeta, Sqlite3TableMeta} from "./try-fetch-table-meta";
import {sqlite_master} from "./sqlite-master";
import {DEFAULT_SCHEMA_NAME} from "../constants";
import {Connection} from "../execution";

export interface Sqlite3SchemaMeta {
    schemaAlias : string,

    tables : readonly Sqlite3TableMeta[],
}

export async function tryFetchSchemaMeta (
    connection : Connection,
    rawSchemaAlias : string|undefined
) : Promise<squill.SchemaMeta|undefined> {
    const schemaAlias = (
        rawSchemaAlias == undefined ?
        DEFAULT_SCHEMA_NAME :
        rawSchemaAlias
    );
    const tables = await squill
        .from(
            /**
             * Hacky workaround for SQLite bug.
             * https://github.com/AnyhowStep/tsql-sqlite3-browser/issues/5
             */
            sqlite_master
                .setSchemaName(schemaAlias)
                .as("x")
        )
        .whereEq(
            columns => columns.type,
            "table"
        )
        .selectValue(columns => columns.name)
        .map(async (row) => {
            const tableMeta = await tryFetchTableMeta(
                connection,
                schemaAlias,
                row.x.name
            );
            if (tableMeta == undefined) {
                throw new Error(`Table ${squill.pascalStyleEscapeString(schemaAlias)}.${squill.pascalStyleEscapeString(row.x.name)} does not exist`);
            } else {
                return tableMeta;
            }
        })
        .fetchAll(connection);
    return {
        schemaAlias,
        tables,
    };
}
