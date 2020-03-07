import * as tm from "type-mapping";
import * as squill from "@squill/squill";
import {Connection} from "../execution";
import {sqlite_master} from "./sqlite-master";

export interface Sqlite3ColumnMeta {
    cid : bigint,
    name : string,
    type : string,
    notnull : 1n|0n,
    dflt_value : string|null,
    pk : 1n|0n,

    //We will need to init these values ourselves
    isAutoIncrement : boolean,
    isUnique : boolean,
    isPrimaryKey : boolean,

    columnAlias : string,
    isNullable : boolean,
    /**
     * If `undefined`, there is no explicit default value.
     */
    explicitDefaultValue : string|undefined,
    /**
     * If `undefined`, there is no generation expression.
     *
     * @todo
     */
    generationExpression : string|undefined,
}

export interface Sqlite3TableMeta {
    tableAlias : string,

    columns : readonly Sqlite3ColumnMeta[],
    candidateKeys : readonly squill.CandidateKeyMeta[],

    primaryKey : squill.CandidateKeyMeta|undefined,
}

export async function tryFetchTableMeta (
    connection : Connection,
    schemaAlias : string,
    tableAlias : string
) : Promise<Sqlite3TableMeta|undefined> {
    const sql = await sqlite_master
        .setSchemaName(schemaAlias)
        .whereEqPrimaryKey({
            name : tableAlias,
        })
        .fetchValue(
            connection,
            columns => columns.sql
        )
        .orUndefined();
    if (sql === undefined) {
        return undefined;
    }
    if (sql === null) {
        throw new Error(`Table ${tableAlias} should have SQL string`);
    }

    //Modified version of
    //http://afoucal.free.fr/index.php/2009/01/26/get-default-value-and-unique-attribute-field-sqlite-database-using-air/
    const allColumnDefSql = sql.replace(/^CREATE\s+\w+\s+(("\w+"|\w+)|\[(.+)\])\s+(\(|AS|)/im , "");
    function getColumnDefSqlImpl (columnAlias : string) {
        const columnRegex = new RegExp(columnAlias + "(.*?)(,|\r|$)", "m");

        const columnDefSqlMatch = allColumnDefSql.match(columnRegex);
        if (columnDefSqlMatch == undefined) {
            return undefined;
        }
        return columnDefSqlMatch[1];
    }
    function getColumnDefSql (columnAlias : string) {
        const resultQuoted = getColumnDefSqlImpl(squill.escapeIdentifierWithDoubleQuotes(columnAlias));
        if (resultQuoted != undefined) {
            return resultQuoted;
        }
        const resultUnquoted = getColumnDefSqlImpl(columnAlias);
        if (resultUnquoted != undefined) {
            return resultUnquoted;
        }
        throw new Error(`Cannot find column definition for ${tableAlias}.${columnAlias}`);
    }
    function isAutoIncrement (columnAlias : string) {
        return /AUTOINCREMENT/i.test(getColumnDefSql(columnAlias));
    }
    function isUnique (columnAlias : string) {
        return /UNIQUE/i.test(getColumnDefSql(columnAlias));
    }
    function isPrimaryKey (columnAlias : string) {
        return /PRIMARY\s+KEY/i.test(getColumnDefSql(columnAlias));
    }

    let constraintSql = allColumnDefSql;

    const {execResult} = await connection
        .exec(`pragma table_info(${squill.escapeIdentifierWithDoubleQuotes(tableAlias)})`);
    if (execResult.length != 1) {
        throw new Error(`Expected to fetch table info`);
    }

    const candidateKeys : squill.CandidateKeyMeta[] = [];
    let primaryKey : squill.CandidateKeyMeta|undefined = undefined;

    const resultSet = execResult[0];
    const objArr = resultSet.values.map((row) => {
        const obj = resultSet.columns.reduce(
            (obj, columnAlias, index) => {
                (obj as any)[columnAlias] = row[index];
                return obj;
            },
            {}
        ) as {
            cid : bigint,
            name : string,
            type : string,
            notnull : 1n|0n,
            dflt_value : string|null,
            pk : 1n|0n,

            //We will need to init these values ourselves
            isAutoIncrement : boolean,
            isUnique : boolean,
            isPrimaryKey : boolean,

            columnAlias : string,
            isNullable : boolean,
            explicitDefaultValue : string|undefined,
            generationExpression : string|undefined,
        };

        obj.isAutoIncrement = isAutoIncrement(obj.name);
        obj.isUnique = isUnique(obj.name);
        obj.isPrimaryKey = isPrimaryKey(obj.name);

        obj.columnAlias = obj.name;
        obj.isNullable = tm.BigIntUtil.equal(obj.notnull, tm.BigInt(0));
        obj.explicitDefaultValue = typeof obj.dflt_value == "string" ?
            obj.dflt_value :
            undefined;
        /**
         * @todo
         */
        obj.generationExpression = undefined;

        const columnDef = getColumnDefSql(obj.name);
        constraintSql = constraintSql.replace(columnDef, "");

        if (isPrimaryKey(obj.name)) {
            if (primaryKey != undefined) {
                throw new Error(`Multiple primary keys found`);
            }
            primaryKey = {
                candidateKeyName : obj.name,
                columnAliases : [obj.name],
            };
        } else if (isUnique(obj.name)) {
            const constraintRegex = /CONSTRAINT\s+(.+)\s+UNIQUE/gi;
            const constraintMatch = constraintRegex.exec(columnDef);
            if (constraintMatch == undefined) {
                throw new Error(`Cannot get UNIQUE constraint of ${obj.name}`);
            }
            candidateKeys.push({
                candidateKeyName : squill.tryUnescapeIdentifierWithDoubleQuotes(constraintMatch[1]),
                columnAliases : [obj.name],
            });
        }
        return obj;
    });

    const constraintRegex = /CONSTRAINT\s+(.+)\s+(UNIQUE|PRIMARY\s+KEY)\s*\((.+)\)/gi;
    while (true) {
        const constraintMatch = constraintRegex.exec(constraintSql);
        if (constraintMatch == undefined) {
            break;
        }
        const constraintName = squill.tryUnescapeIdentifierWithDoubleQuotes(constraintMatch[1]);
        const constraintType = constraintMatch[2];
        const constraintColumns = constraintMatch[3];
        const columnRegex = /\s*(.+?)\s*(,|$)/gi;

        const columnAliases : string[] = [];

        while (true) {
            const columnMatch = columnRegex.exec(constraintColumns);
            if (columnMatch == undefined) {
                break;
            }
            columnAliases.push(squill.tryUnescapeIdentifierWithDoubleQuotes(columnMatch[1]));
        }

        if (constraintType.toUpperCase() == "UNIQUE") {
            candidateKeys.push({
                candidateKeyName : constraintName,
                columnAliases,
            });
        } else {
            if (primaryKey != undefined) {
                throw new Error(`Multiple primary keys found`);
            }
            primaryKey = {
                candidateKeyName : constraintName,
                columnAliases,
            };
        }
    }

    return {
        tableAlias,
        columns : objArr,
        candidateKeys,
        primaryKey : candidateKeys.find(candidateKey => candidateKey.candidateKeyName == "PRIMARY"),
    };
}
