import * as squill from "@squill/squill";

export function tryFetchGeneratedColumnExpression(
    _connection : squill.SelectConnection,
    _schemaAlias: string | undefined,
    _tableAlias: string,
    _columnAlias: string
): Promise<string | undefined> {
    /**
     * @todo
     */
    return Promise.resolve(undefined);
}
