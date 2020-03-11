import {tryFetchTableMeta} from "./try-fetch-table-meta";
import {Connection} from "../execution";
import {DEFAULT_SCHEMA_NAME} from "../constants";

export async function tryFetchGeneratedColumnExpression(
    connection : Connection,
    rawSchemaAlias: string | undefined,
    tableAlias: string,
    columnAlias: string
): Promise<string | undefined> {
    const schemaAlias = (
        rawSchemaAlias == undefined ?
        DEFAULT_SCHEMA_NAME :
        rawSchemaAlias
    );
    const tableMeta = await tryFetchTableMeta(
        connection,
        schemaAlias,
        tableAlias
    );
    if (tableMeta == undefined) {
        return undefined;
    }

    const columnMeta = tableMeta.columns
        .find(column => column.columnAlias == columnAlias);
    if (columnMeta == undefined) {
        return undefined;
    }

    return columnMeta.generationExpression;
}
