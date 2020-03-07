import * as squill from "@squill/squill";
import {tryFetchTableMeta} from "./try-fetch-table-meta";
import {sqlite_master} from "./sqlite-master";
import {DEFAULT_SCHEMA_NAME} from "../constants";
import {Connection} from "../execution";

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
            sqlite_master
                .setSchemaName(schemaAlias)
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
                row.sqlite_master.name
            );
            if (tableMeta == undefined) {
                throw new Error(`Table ${squill.pascalStyleEscapeString(schemaAlias)}.${squill.pascalStyleEscapeString(row.sqlite_master.name)} does not exist`);
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
