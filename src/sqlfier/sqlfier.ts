import * as tm from "type-mapping";
import * as squill from "@squill/squill";
import {DEFAULT_SCHEMA_NAME} from "../constants";

/**
* We do not use `ABS(-9223372036854775808)` because of,
* https://github.com/AnyhowStep/tsql/issues/233
*/
export const THROW_AST = "(SELECT SUM(9223372036854775807) FROM (SELECT NULL UNION ALL SELECT NULL))";

const insertBetween = squill.AstUtil.insertBetween;

function normalizeOrderByAndLimitClauses (query : squill.IQueryBase) : squill.IQueryBase {
    /**
     * MySQL behaviour,
     * No `UNION` clause.
     *
     * | `ORDER BY` | `LIMIT` | `UNION ORDER BY` | `UNION LIMIT` | Result
     * |------------|---------|------------------|---------------|-------------------------------------------------
     * | Y          | Y       | Y                | Y             | `ORDER BY ... LIMIT ...) ORDER BY ... LIMIT ...`
     * | Y          | Y       | Y                | N             | `ORDER BY ... LIMIT ...) ORDER BY ...`
     * | Y          | Y       | N                | Y             | `ORDER BY ...) LIMIT ...`
     * | Y          | Y       | N                | N             | `ORDER BY ... LIMIT ...)`
     * | Y          | N       | Y                | Y             | `) ORDER BY ... LIMIT ...`
     * | Y          | N       | Y                | N             | `) ORDER BY ...`
     * | Y          | N       | N                | Y             | `ORDER BY ...) LIMIT ...`
     * | Y          | N       | N                | N             | `ORDER BY ...)`
     * |------------|---------|------------------|---------------|-------------------------------------------------
     * | N          | Y       | Y                | Y             | `LIMIT ...) ORDER BY ... LIMIT ...`
     * | N          | Y       | Y                | N             | `LIMIT ...) ORDER BY ...`
     * | N          | Y       | N                | Y             | `) LIMIT ...`
     * | N          | Y       | N                | N             | `LIMIT ...)`
     * | N          | N       | Y                | Y             | `) ORDER BY ... LIMIT ...`
     * | N          | N       | Y                | N             | `) ORDER BY ...`
     * | N          | N       | N                | Y             | `) LIMIT ...`
     * | N          | N       | N                | N             | `)`
     *
     * Observations:
     * + With no `LIMIT` clause, the `UNION ORDER BY` and `UNION LIMIT` take over, regardless of `ORDER BY`
     * + With the `LIMIT` clause, the `UNION ORDER BY` never takes over
     * + With the `LIMIT` clause, the `UNION LIMIT` takes over when there is no `UNION ORDER BY`
     *
     * + `UNION LIMIT` takes over when, !`LIMIT` || !`UNION ORDER BY`
     * + `UNION ORDER BY` takes over when, !`LIMIT`
     */
    /**
     *
     * MySQL behaviour,
     * With `UNION` clause.
     *
     * Nothing is taken over.
     */

    const orderByClause = (
        (
            query.compoundQueryOrderByClause != undefined &&
            query.compoundQueryClause == undefined &&
            query.limitClause == undefined
        ) ?
        query.compoundQueryOrderByClause :
        query.orderByClause
    );
    const limitClause = (
        (
            query.compoundQueryLimitClause != undefined &&
            query.compoundQueryClause == undefined &&
            (
                query.limitClause == undefined ||
                query.compoundQueryOrderByClause == undefined
            )
        ) ?
        query.compoundQueryLimitClause :
        query.limitClause
    );

    const compoundQueryOrderByClause = (
        orderByClause == query.compoundQueryOrderByClause ?
        undefined :
        query.compoundQueryOrderByClause
    );
    const compoundQueryLimitClause = (
        limitClause == query.compoundQueryLimitClause ?
        undefined :
        query.compoundQueryLimitClause
    );

    return {
        ...query,
        orderByClause,
        limitClause,
        compoundQueryOrderByClause,
        compoundQueryLimitClause,
    };
}

function selectClauseColumnToSql (column : squill.IColumn, isDerivedTable : boolean) : string[] {
    return [
        [
            squill.escapeIdentifierWithDoubleQuotes(column.tableAlias),
            ".",
            squill.escapeIdentifierWithDoubleQuotes(column.columnAlias)
        ].join(""),
        "AS",
        squill.escapeIdentifierWithDoubleQuotes(
            isDerivedTable ?
            column.columnAlias :
            `${column.tableAlias}${squill.SEPARATOR}${column.columnAlias}`
        )
    ];
}
function selectClauseColumnArrayToSql (columns : squill.IColumn[], isDerivedTable : boolean) : string[] {
    columns.sort((a, b) => {
        const tableAliasCmp = a.tableAlias.localeCompare(b.tableAlias);
        if (tableAliasCmp != 0) {
            return tableAliasCmp;
        }
        return a.columnAlias.localeCompare(b.columnAlias);
    });
    const result : string[] = [];
    for (const column of columns) {
        if (result.length > 0) {
            result.push(",");
        }
        result.push(
            ...selectClauseColumnToSql(column, isDerivedTable)
        );
    }
    return result;
}
function selectClauseColumnMapToSql (map : squill.ColumnMap, isDerivedTable : boolean) : string[] {
    const columns = squill.ColumnUtil.fromColumnMap(map);
    return selectClauseColumnArrayToSql(columns, isDerivedTable);
}
function selectClauseColumnRefToSql (ref : squill.ColumnRef, isDerivedTable : boolean) : string[] {
    const columns = squill.ColumnUtil.fromColumnRef(ref);
    return selectClauseColumnArrayToSql(columns, isDerivedTable);
}
function selectClauseToSql (
    selectClause : squill.SelectClause,
    toSql : (ast : squill.Ast) => string,
    isDerivedTable : boolean,
    isDistinct : boolean
) : string[] {
    const result : string[] = [];
    for (const selectItem of selectClause) {
        if (result.length > 0) {
            result.push(",");
        }
        if (squill.ColumnUtil.isColumn(selectItem)) {
            result.push(
                ...selectClauseColumnToSql(selectItem, isDerivedTable)
            );
        } else if (squill.ExprSelectItemUtil.isExprSelectItem(selectItem)) {
            result.push(
                toSql(selectItem.unaliasedAst),
                "AS",
                squill.escapeIdentifierWithDoubleQuotes(
                    isDerivedTable ?
                    selectItem.alias :
                    `${selectItem.tableAlias}${squill.SEPARATOR}${selectItem.alias}`
                )
            );
        } else if (squill.ColumnMapUtil.isColumnMap(selectItem)) {
            result.push(...selectClauseColumnMapToSql(selectItem, isDerivedTable));
        } else if (squill.ColumnRefUtil.isColumnRef(selectItem)) {
            result.push(...selectClauseColumnRefToSql(selectItem, isDerivedTable));
        } else {
            throw new Error(`Not implemented`);
        }
    }
    return isDistinct ?
        ["SELECT DISTINCT", ...result] :
        ["SELECT", ...result];
}

function fromClauseToSql (
    currentJoins : squill.FromClauseUtil.AfterFromClause["currentJoins"],
    toSql : (ast : squill.Ast) => string
) : string[] {
    const result : string[] = [];
    for (const join of currentJoins) {
        if (join.joinType == squill.JoinType.FROM) {
            result.push("FROM");
        } else {
            result.push(join.joinType, "JOIN");
        }
        if (squill.isIdentifierNode(join.tableAst)) {
            const lastIdentifier = join.tableAst.identifiers[join.tableAst.identifiers.length-1];
            if (lastIdentifier == join.tableAlias) {
                result.push(toSql(join.tableAst));
            } else {
                result.push(
                    toSql(join.tableAst),
                    "AS",
                    squill.escapeIdentifierWithDoubleQuotes(join.tableAlias)
                );
            }
        } else if (squill.QueryBaseUtil.isQuery(join.tableAst)) {
            result.push("(", queryToSql(join.tableAst, toSql, true), ")");
            result.push("AS");
            result.push(squill.escapeIdentifierWithDoubleQuotes(join.tableAlias));
        } else if (squill.Parentheses.IsParentheses(join.tableAst) && squill.QueryBaseUtil.isQuery(join.tableAst.ast)) {
            const subQuery = join.tableAst.ast;

            result.push("(", queryToSql(subQuery, toSql, true), ")");
            result.push("AS");
            result.push(squill.escapeIdentifierWithDoubleQuotes(join.tableAlias));
        } else {
            result.push("(", toSql(join.tableAst), ")");
            result.push("AS");
            result.push(squill.escapeIdentifierWithDoubleQuotes(join.tableAlias));
        }
        if (join.onClause != undefined) {
            result.push("ON");
            result.push(toSql(squill.AstUtil.tryUnwrapParentheses(join.onClause.ast)));
        }
    }
    return result;
}

function whereClauseToSql (whereClause : squill.WhereClause, toSql : (ast : squill.Ast) => string) : string[] {
    return [
        "WHERE",
        toSql(squill.AstUtil.tryUnwrapParentheses(whereClause.ast))
    ];
}

function orderByClauseToSql (orderByClause : squill.OrderByClause, toSql : (ast : squill.Ast) => string) : string[] {
    if (orderByClause.length == 0) {
        return [];
    }
    const result : string[] = [];
    for (const [sortExpr, sortDirection] of orderByClause) {
        if (result.length > 0) {
            result.push(",");
        }
        if (squill.ColumnUtil.isColumn(sortExpr)) {
            if (sortExpr.unaliasedAst == undefined) {
                result.push(
                    [
                        squill.escapeIdentifierWithDoubleQuotes(sortExpr.tableAlias),
                        ".",
                        squill.escapeIdentifierWithDoubleQuotes(sortExpr.columnAlias)
                    ].join("")
                );
            } else {
                result.push(
                    squill.escapeIdentifierWithDoubleQuotes(
                        `${sortExpr.tableAlias}${squill.SEPARATOR}${sortExpr.columnAlias}`
                    )
                );
            }
        } else if (squill.ExprUtil.isExpr(sortExpr)) {
            if (squill.LiteralValueNodeUtil.isLiteralValueNode(sortExpr.ast)) {
                if (sortExpr.ast.literalValueType == squill.LiteralValueType.BIGINT_SIGNED) {
                    result.push(toSql([sortExpr.ast, "+ 0"]));
                } else {
                    result.push(toSql(sortExpr.ast));
                }
            } else {
                result.push(toSql(sortExpr.ast));
            }
        } else {
            result.push(toSql(sortExpr.unaliasedAst));
        }
        result.push(sortDirection);
    }
    return [
        "ORDER BY",
        ...result
    ];
}

function groupByClauseToSql (groupByClause : squill.GroupByClause, _toSql : (ast : squill.Ast) => string) : string[] {
    if (groupByClause.length == 0) {
        return [];
    }

    const result : string[] = [];
    for (const column of groupByClause) {
        if (result.length > 0) {
            result.push(",");
        }
        if (column.tableAlias == squill.ALIASED) {
            result.push(
                squill.escapeIdentifierWithDoubleQuotes(
                    `${column.tableAlias}${squill.SEPARATOR}${column.columnAlias}`
                )
            );
        } else {
            result.push(
                [
                    squill.escapeIdentifierWithDoubleQuotes(column.tableAlias),
                    ".",
                    squill.escapeIdentifierWithDoubleQuotes(column.columnAlias)
                ].join("")
            );
        }
    }

    return [
        "GROUP BY",
        ...result
    ];
}

function havingClauseToSql (havingClause : squill.HavingClause, toSql : (ast : squill.Ast) => string) : string[] {
    return [
        "HAVING",
        toSql(squill.AstUtil.tryUnwrapParentheses(havingClause.ast))
    ];
}

function limitClauseToSql (limitClause : squill.LimitClause, _toSql : (ast : squill.Ast) => string) : string[] {
    return [
        "LIMIT",
        squill.escapeValue(limitClause.maxRowCount),
        "OFFSET",
        squill.escapeValue(limitClause.offset),
    ];
}

function compoundQueryClauseToSql (compoundQueryClause : squill.CompoundQueryClause, toSql : (ast : squill.Ast) => string) : string[] {
    const result : string[] = [];
    for (const rawCompoundQuery of compoundQueryClause) {
        result.push(rawCompoundQuery.compoundQueryType);
        if (!rawCompoundQuery.isDistinct) {
            result.push("ALL");
        }

        const query = rawCompoundQuery.query;
        if (
            query.orderByClause != undefined ||
            query.limitClause != undefined ||
            query.compoundQueryClause != undefined ||
            query.compoundQueryOrderByClause != undefined ||
            query.compoundQueryLimitClause != undefined
        ) {
            result.push(
                "SELECT * FROM (",
                toSql(query),
                ")"
            );
        } else {
            result.push(toSql(query));
        }
    }
    return result;
}

function queryToSql (
    rawQuery : squill.IQueryBase,
    toSql : (ast : squill.Ast) => string,
    isDerivedTable : boolean
) {
    const query = normalizeOrderByAndLimitClauses(rawQuery);

    if (
        (
            /**
             * If we have both a compound `ORDER BY/LIMIT` clause
             * and regular `ORDER BY/LIMIT` clause,
             * we will need a derived table because
             * SQLite only supports on `ORDER BY` and `LIMIT` clause for the entire query.
             */
            (
                query.compoundQueryOrderByClause != undefined ||
                query.compoundQueryLimitClause != undefined
            ) &&
            (
                query.orderByClause != undefined ||
                query.limitClause != undefined
            )
        ) ||
        /**
         * If we have a compound query and an `ORDER BY` or `LIMIT` clause,
         * we will need to make the query a derived table because
         * SQLite only supports on `ORDER BY` and `LIMIT` clause for the entire query.
         */
        (
            query.compoundQueryClause != undefined &&
            (
                query.orderByClause != undefined ||
                query.limitClause != undefined
            )
        )
    ) {
        /**
         * We have to apply some hackery to get the same behaviour as MySQL.
         */
        const innerQuery = {
            ...query,
            compoundQueryClause : undefined,
            compoundQueryOrderByClause : undefined,
            compoundQueryLimitClause : undefined,
        };
        const result : string[] = [
            "SELECT * FROM (",
            toSql(innerQuery),
            ")"
        ];

        if (query.compoundQueryClause != undefined) {
            result.push(compoundQueryClauseToSql(query.compoundQueryClause, toSql).join(" "));
        }

        if (query.compoundQueryOrderByClause != undefined) {
            result.push(orderByClauseToSql(query.compoundQueryOrderByClause, toSql).join(" "));
        }

        if (query.compoundQueryLimitClause != undefined) {
            result.push(limitClauseToSql(query.compoundQueryLimitClause, toSql).join(" "));
        }

        return result.join(" ");
    }

    const result : string[] = [];
    if (query.selectClause != undefined) {
        result.push(selectClauseToSql(query.selectClause, toSql, isDerivedTable, query.isDistinct).join(" "));
    }
    if (query.fromClause != undefined && query.fromClause.currentJoins != undefined) {
        result.push(fromClauseToSql(query.fromClause.currentJoins, toSql).join(" "));
    }
    if (query.limitClause != undefined && tm.BigIntUtil.equal(query.limitClause.maxRowCount, 0)) {
        /**
         * ```sql
         *  CREATE TABLE "myTable" ("myColumn" INT PRIMARY KEY);
         *  INSERT INTO "myTable"("myColumn") VALUES (4);
         *  SELECT
         *      COALESCE(
         *          (
         *              SELECT
         *                  "myTable"."myColumn" AS "myTable--myColumn"
         *              FROM
         *                  "myTable"
         *              LIMIT
         *                  0
         *              OFFSET
         *                  0
         *          ),
         *          3
         *      );
         * ```
         * The above gives `4` on SQLite.
         * Gives `3` on MySQL and PostgreSQL.
         * SQLite is bugged.
         *
         * The fix is to use `WHERE FALSE` when `LIMIT 0` is detected.
         *
         * ```sql
         *  CREATE TABLE "myTable" ("myColumn" INT PRIMARY KEY);
         *  INSERT INTO "myTable"("myColumn") VALUES (4);
         *  SELECT
         *      COALESCE(
         *          (
         *              SELECT
         *                  "myTable"."myColumn" AS "myTable--myColumn"
         *              FROM
         *                  "myTable"
         *              WHERE
         *                  FALSE
         *              LIMIT
         *                  0
         *              OFFSET
         *                  0
         *          ),
         *          3
         *      );
         * ```
         */
        result.push("WHERE FALSE");
    } else {
        if (query.whereClause != undefined) {
            result.push(whereClauseToSql(query.whereClause, toSql).join(" "));
        }
    }
    if (query.groupByClause == undefined || query.groupByClause.length == 0) {
        if (query.havingClause != undefined) {
            /**
             * Workaround for `<empty grouping set>` not supported by SQLite
             */
            throw new Error(`SQLite does not support ... GROUP BY () HAVING ...`);
            //result.push(havingClauseToSql(query.havingClause, toSql).join(" "));
        }
    } else {
        result.push(groupByClauseToSql(query.groupByClause, toSql).join(" "));
        if (query.havingClause != undefined) {
            result.push(havingClauseToSql(query.havingClause, toSql).join(" "));
        }
    }

    if (query.orderByClause != undefined) {
        result.push(orderByClauseToSql(query.orderByClause, toSql).join(" "));
    }

    if (query.limitClause != undefined) {
        result.push(limitClauseToSql(query.limitClause, toSql).join(" "));
    }

    if (query.compoundQueryClause != undefined) {
        result.push(compoundQueryClauseToSql(query.compoundQueryClause, toSql).join(" "));
    }

    if (query.compoundQueryOrderByClause != undefined) {
        result.push(orderByClauseToSql(query.compoundQueryOrderByClause, toSql).join(" "));
    }

    if (query.compoundQueryLimitClause != undefined) {
        result.push(limitClauseToSql(query.compoundQueryLimitClause, toSql).join(" "));
    }

    return result.join(" ");
}

export const sqlfier : squill.Sqlfier = {
    identifierSqlfier : (identifierNode) => identifierNode.identifiers
        .map(squill.escapeIdentifierWithDoubleQuotes)
        .join("."),
    literalValueSqlfier : {
        [squill.LiteralValueType.DECIMAL] : ({literalValue, precision, scale}) => squill.functionCall(
            "decimal_ctor",
            [
                squill.pascalStyleEscapeString(literalValue),
                squill.escapeValue(precision),
                squill.escapeValue(scale)
            ]
        )/*toSql(
            castAsDecimal(
                literalValue,
                precision,
                scale
            ).ast
        )*/,
        [squill.LiteralValueType.STRING] : ({literalValue}) => {
            if (literalValue.includes('\0')) {
                throw new Error(`String literal may not contain null characters`);
            }
            return squill.pascalStyleEscapeString(literalValue);
        },
        [squill.LiteralValueType.DOUBLE] : ({literalValue}) => {
            if (isNaN(literalValue)) {
                throw new squill.DataOutOfRangeError({
                    message : `Literal ${literalValue} not allowed`,
                    /**
                     * @todo Figure out how to get the entire SQL, then throw?
                     */
                    sql : undefined,
                });
            }
            if (literalValue == Infinity) {
                return "(1e999)";
            }
            if (literalValue == -Infinity) {
                return "(-1e999)";
            }
            return squill.escapeValue(literalValue);
        },
        [squill.LiteralValueType.BIGINT_SIGNED] : ({literalValue}) => squill.escapeValue(literalValue),
        /**
         * @deprecated
         */
        //[LiteralValueType.BIGINT_UNSIGNED] : ({literalValue}) => escapeValue(literalValue),
        [squill.LiteralValueType.BOOLEAN] : ({literalValue}) => squill.escapeValue(literalValue),
        [squill.LiteralValueType.BUFFER] : ({literalValue}) => squill.escapeValue(literalValue),
        [squill.LiteralValueType.NULL] : ({literalValue}) => squill.escapeValue(literalValue),
        [squill.LiteralValueType.DATE_TIME] : ({literalValue}, toSql) => toSql(
            squill.utcStringToTimestamp(
                squill.DateTimeUtil.toSqlUtc(literalValue, 3)
            ).ast
        ),
    },
    operatorSqlfier : {
        /*
            Comparison Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/comparison-operators.html
        */
        [squill.OperatorType.BETWEEN_AND] : ({operands}) => [
            operands[0],
            "BETWEEN",
            operands[1],
            "AND",
            operands[2]
        ],
        [squill.OperatorType.NOT_BETWEEN_AND] : ({operands}) => [
            operands[0],
            "NOT BETWEEN",
            operands[1],
            "AND",
            operands[2]
        ],
        [squill.OperatorType.COALESCE] : ({operatorType, operands}) => squill.functionCall(operatorType, operands),
        [squill.OperatorType.EQUAL] : ({operands}) => insertBetween(operands, "="),
        [squill.OperatorType.NULL_SAFE_EQUAL] : ({operands}) => insertBetween(operands, "IS"),
        [squill.OperatorType.NOT_NULL_SAFE_EQUAL] : ({operands}) => insertBetween(operands, "IS NOT"),
        [squill.OperatorType.LESS_THAN] : ({operands}) => insertBetween(operands, "<"),
        [squill.OperatorType.GREATER_THAN] : ({operands}) => insertBetween(operands, ">"),
        [squill.OperatorType.LESS_THAN_OR_EQUAL] : ({operands}) => insertBetween(operands, "<="),
        [squill.OperatorType.GREATER_THAN_OR_EQUAL] : ({operands}) => insertBetween(operands, ">="),
        [squill.OperatorType.IN_ARRAY] : ({operands : [x, ...rest]}) => {
            return [
                x,
                squill.functionCall("IN", [...rest])
            ];
        },
        [squill.OperatorType.IN_QUERY] : ({operands : [x, y]}) => {
            /**
             * https://github.com/AnyhowStep/tsql/issues/198
             */
            return [
                x,
                squill.functionCall("IN", [
                    squill.Parentheses.IsParentheses(y) ?
                    y.ast :
                    y
                ])
            ];
        },
        [squill.OperatorType.NOT_IN_ARRAY] : ({operands : [x, ...rest]}) => {
            return [
                x,
                squill.functionCall("NOT IN", [...rest])
            ];
        },
        [squill.OperatorType.NOT_IN_QUERY] : ({operands : [x, y]}) => {
            /**
             * https://github.com/AnyhowStep/tsql/issues/198
             */
            return [
                x,
                squill.functionCall("NOT IN", [
                    squill.Parentheses.IsParentheses(y) ?
                    y.ast :
                    y
                ])
            ];
        },
        [squill.OperatorType.IS_NOT_NULL] : ({operands}) => [operands[0], "IS NOT NULL"],
        [squill.OperatorType.IS_NULL] : ({operands}) => [operands[0], "IS NULL"],
        [squill.OperatorType.IS_UNKNOWN] : ({operands}) => [operands[0], "IS NULL"],
        [squill.OperatorType.IS_NOT_UNKNOWN] : ({operands}) => [operands[0], "IS NOT NULL"],
        [squill.OperatorType.IS_TRUE] : ({operands}) => [operands[0], "IS TRUE"],
        [squill.OperatorType.IS_NOT_TRUE] : ({operands}) => [operands[0], "IS NOT TRUE"],
        [squill.OperatorType.IS_FALSE] : ({operands}) => [operands[0], "IS FALSE"],
        [squill.OperatorType.IS_NOT_FALSE] : ({operands}) => [operands[0], "IS NOT FALSE"],
        [squill.OperatorType.LIKE_ESCAPE] : ({operands : [expr, pattern, escapeChar]}) => {
            if (squill.LiteralValueNodeUtil.isLiteralValueNode(escapeChar) && escapeChar.literalValue === "") {
                return [
                    expr, "LIKE", pattern
                ];
            } else {
                return [
                    expr, "LIKE", pattern, "ESCAPE", escapeChar
                ];
            }
        },
        [squill.OperatorType.NOT_LIKE_ESCAPE] : ({operands : [expr, pattern, escapeChar]}) => {
            if (squill.LiteralValueNodeUtil.isLiteralValueNode(escapeChar) && escapeChar.literalValue === "") {
                return [
                    expr, "NOT LIKE", pattern
                ];
            } else {
                return [
                    expr, "NOT LIKE", pattern, "ESCAPE", escapeChar
                ];
            }
        },
        [squill.OperatorType.NOT_EQUAL] : ({operands}) => insertBetween(operands, "<>"),
        [squill.OperatorType.LEAST] : ({operands}) => squill.functionCall("MIN", operands),
        [squill.OperatorType.GREATEST] : ({operands}) => squill.functionCall("MAX", operands),

        /*
            Logical Operators
            https://dev.mysql.com/doc/refman/8.0/en/logical-operators.html
        */
        [squill.OperatorType.AND] : ({operands}) => insertBetween(operands, "AND"),
        [squill.OperatorType.OR] : ({operands}) => insertBetween(operands, "OR"),
        [squill.OperatorType.NOT] : ({operands}) => [
            "NOT",
            operands[0]
        ],
        [squill.OperatorType.XOR] : ({operands}) => insertBetween(operands, "<>"),

        /*
            Control Flow Functions
            https://dev.mysql.com/doc/refman/8.0/en/control-flow-functions.html
        */
        [squill.OperatorType.IF] : ({operands : [a, b, c]}) => [
            "CASE WHEN",
            a,
            "THEN",
            b,
            "ELSE",
            c,
            "END"
        ],
        [squill.OperatorType.IF_NULL] : ({operands}) => squill.functionCall("IFNULL", operands),
        [squill.OperatorType.NULL_IF_EQUAL] : ({operands}) => squill.functionCall("NULLIF", operands),

        /*
            String Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/string-functions.html
        */
        [squill.OperatorType.ASCII] : ({operands}) => squill.functionCall("ASCII", operands),
        [squill.OperatorType.BIN] : ({operands}) => squill.functionCall("BIN", operands),
        [squill.OperatorType.BIT_LENGTH] : ({operands}) => (
            [
                squill.functionCall(
                    "LENGTH",
                    [
                        squill.functionCall("CAST", [[operands, "AS BLOB"]])
                    ]
                ),
                "* 8"
            ]
        ),
        [squill.OperatorType.CHAR_LENGTH] : ({operands}) => squill.functionCall("LENGTH", operands),
        [squill.OperatorType.OCTET_LENGTH] : ({operands}) => squill.functionCall(
            "LENGTH",
            [
                squill.functionCall("CAST", [[operands, "AS BLOB"]])
            ]
        ),
        [squill.OperatorType.CONCAT] : ({operands}) => insertBetween(operands, "||"),
        [squill.OperatorType.NULL_SAFE_CONCAT] : ({operands}) => (
            insertBetween(
                operands.map(operand => squill.functionCall("COALESCE", [operand, "''"])),
                "||"
            )
        ),
        [squill.OperatorType.CONCAT_WS] : ({operands}) => squill.functionCall("CONCAT_WS", operands),
        [squill.OperatorType.FROM_BASE64] : ({operands}) => squill.functionCall("FROM_BASE64", operands),
        [squill.OperatorType.HEX] : ({operands}) => squill.functionCall("HEX", operands),
        [squill.OperatorType.IN_STR] : ({operands}) => squill.functionCall("INSTR", operands),
        [squill.OperatorType.LPAD] : ({operands}) => squill.functionCall("LPAD", operands),
        [squill.OperatorType.RPAD] : ({operands}) => squill.functionCall("RPAD", operands),
        [squill.OperatorType.LTRIM] : ({operands}) => squill.functionCall("LTRIM", operands),
        [squill.OperatorType.RTRIM] : ({operands}) => squill.functionCall("RTRIM", operands),
        [squill.OperatorType.TRIM] : ({operands}) => squill.functionCall("TRIM", operands),
        [squill.OperatorType.POSITION] : ({operands}) => squill.functionCall("INSTR", [operands[1], operands[0]]),
        [squill.OperatorType.REPEAT] : ({operands}) => squill.functionCall("REPEAT", operands),
        [squill.OperatorType.REPLACE] : ({operands}) => squill.functionCall("REPLACE", operands),
        [squill.OperatorType.REVERSE] : ({operands}) => squill.functionCall("REVERSE", operands),
        [squill.OperatorType.TO_BASE64] : ({operands}) => squill.functionCall("TO_BASE64", operands),
        [squill.OperatorType.UNHEX] : ({operands}) => squill.functionCall("UNHEX", operands),
        [squill.OperatorType.UPPER] : ({operands}) => squill.functionCall("UPPER", operands),
        [squill.OperatorType.LOWER] : ({operands}) => squill.functionCall("LOWER", operands),

        /*
            Arithmetic Operators
            https://dev.mysql.com/doc/refman/8.0/en/arithmetic-functions.html
        */
        [squill.OperatorType.FRACTIONAL_DIVISION] : ({operands}) => insertBetween(operands, "/"),
        [squill.OperatorType.INTEGER_DIVISION] : ({operands, typeHint}) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                return squill.functionCall(
                    "CAST",
                    [
                        [
                            insertBetween(operands, "/"),
                            "AS BIGINT"
                        ]
                    ]
                );
            } else if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_div", operands);
            } else {
                throw new Error(`INTEGER_DIVISION not implemented for ${typeHint}`);
            }
        },
        /**
         * In SQLite, `%` ONLY does integer remainder
         */
        [squill.OperatorType.INTEGER_REMAINDER] : ({operands, typeHint}, toSql) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                return squill.functionCall(
                    "CAST",
                    [
                        toSql(
                            insertBetween(
                                operands.map(op => squill.functionCall(
                                    "CAST",
                                    [
                                        toSql(op) + " AS INTEGER"
                                    ]
                                )),
                                "%"
                            )
                        ) + " AS DOUBLE"
                    ]
                );
            } else if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return insertBetween(operands, "%");
            } else {
                throw new Error(`INTEGER_REMAINDER not implemented for ${typeHint}`);
            }
        },
        [squill.OperatorType.FRACTIONAL_REMAINDER] : ({operands, typeHint}) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                function naiveFractionalRemainder (dividend : squill.Ast, divisor : squill.Ast) {
                    const absDivisor = squill.functionCall("ABS", [divisor]);

                    return squill.parentheses(
                        [
                            dividend,
                            "-",
                            squill.functionCall(
                                "FLOOR",
                                [
                                    [
                                        dividend,
                                        "/",
                                        absDivisor
                                    ]
                                ]
                            ),
                            "*",
                            absDivisor
                        ],
                        false
                    );
                }
                const dividend = operands[0];
                const divisor = operands[1];

                return [
                    "CASE",
                    "WHEN", dividend, "= 1e999 THEN NULL",
                    "WHEN", dividend, "= -1e999 THEN NULL",
                    "WHEN", divisor, "= 1e999 THEN",
                    dividend,
                    "WHEN", divisor, "= -1e999 THEN",
                    dividend,
                    "WHEN", dividend, ">= 0 THEN", naiveFractionalRemainder(dividend, divisor),
                    "ELSE",
                    "-", naiveFractionalRemainder(squill.parentheses(["-", dividend], false), divisor),
                    "END"
                ];
            } else {
                throw new Error(`FRACTIONAL_REMAINDER not implemented for ${typeHint}`);
            }
        },
        [squill.OperatorType.ADDITION] : ({operands, typeHint}) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_add", operands);
            } else {
                return squill.functionCall(
                    "COALESCE",
                    [
                        insertBetween(operands, "+"),
                        THROW_AST
                    ]
                );
            }
        },
        [squill.OperatorType.SUBTRACTION] : ({operands, typeHint}) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_sub", operands);
            } else {
                return squill.functionCall(
                    "COALESCE",
                    [
                        insertBetween(operands, "-"),
                        THROW_AST
                    ]
                );
            }
        },
        [squill.OperatorType.MULTIPLICATION] : ({operands, typeHint}) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_mul", operands);
            } else {
                return squill.functionCall(
                    "COALESCE",
                    [
                        insertBetween(operands, "*"),
                        THROW_AST
                    ]
                );
            }
        },
        [squill.OperatorType.UNARY_MINUS] : ({operands, typeHint}) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_neg", operands);
            } else {
                return ["-", operands[0]];
            }
        },

        /*
            Mathematical Functions
            https://dev.mysql.com/doc/refman/8.0/en/mathematical-functions.html
        */
        [squill.OperatorType.ABSOLUTE_VALUE] : ({operands}) => squill.functionCall("ABS", operands),
        [squill.OperatorType.ARC_COSINE] : ({operands}) => squill.functionCall("ACOS", operands),
        [squill.OperatorType.ARC_SINE] : ({operands}) => squill.functionCall("ASIN", operands),
        [squill.OperatorType.ARC_TANGENT] : ({operands}) => squill.functionCall("ATAN", operands),
        [squill.OperatorType.ARC_TANGENT_2] : ({operands}) => squill.functionCall("ATAN2", operands),
        [squill.OperatorType.CUBE_ROOT] : ({operands}) => squill.functionCall("CBRT", operands),
        [squill.OperatorType.CEILING] : ({operands}) => squill.functionCall("CEILING", operands),
        [squill.OperatorType.COSINE] : ({operands}) => squill.functionCall("COS", operands),
        [squill.OperatorType.COTANGENT] : ({operands}) => squill.functionCall("COT", operands),
        [squill.OperatorType.DEGREES] : ({operands}) => [operands[0], "* (180.0/3.141592653589793)"],
        [squill.OperatorType.NATURAL_EXPONENTIATION] : ({operands}) => squill.functionCall("EXP", operands),
        [squill.OperatorType.FLOOR] : ({operands}) => squill.functionCall("FLOOR", operands),
        [squill.OperatorType.LN] : ({operands}) => squill.functionCall("LN", operands),
        [squill.OperatorType.LOG] : ({operands}) => squill.functionCall("LOG", operands),
        [squill.OperatorType.LOG2] : ({operands}) => squill.functionCall("LOG2", operands),
        [squill.OperatorType.LOG10] : ({operands}) => squill.functionCall("LOG10", operands),
        [squill.OperatorType.PI] : () => squill.functionCall("PI", []),
        [squill.OperatorType.POWER] : ({operands}) => squill.functionCall("POWER", operands),
        [squill.OperatorType.RADIANS] : ({operands}) => [operands[0], "* (3.141592653589793/180.0)"],
        [squill.OperatorType.RANDOM] : ({operands, typeHint}) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                return squill.functionCall("FRANDOM", operands);
            } else if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("RANDOM", operands);
            } else {
                throw new Error(`RANDOM not implemented for ${typeHint}`);
            }
        },
        //[squill.OperatorType.ROUND] : ({operands}) => squill.functionCall("ROUND", operands),
        [squill.OperatorType.SIGN] : ({operands}) => squill.functionCall("SIGN", operands),
        [squill.OperatorType.SINE] : ({operands}) => squill.functionCall("SIN", operands),
        [squill.OperatorType.SQUARE_ROOT] : ({operands}) => squill.functionCall("SQRT", operands),
        [squill.OperatorType.TANGENT] : ({operands}) => squill.functionCall("TAN", operands),
        //[squill.OperatorType.TRUNCATE] : ({operands}) => squill.functionCall("TRUNCATE", operands),

        /*
            Date and Time Functions
            https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html
        */
        [squill.OperatorType.CURRENT_DATE] : () => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d"),
                squill.pascalStyleEscapeString("now")
            ]
        ),
        [squill.OperatorType.CURRENT_TIMESTAMP_0] : () => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%S"),
                squill.pascalStyleEscapeString("now")
            ]
        ),
        [squill.OperatorType.CURRENT_TIMESTAMP_1] : () => squill.functionCall(
            "substr",
            [
                squill.functionCall(
                    "strftime",
                    [
                        squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                        squill.pascalStyleEscapeString("now")
                    ]
                ),
                "1",
                "21"
            ]
        ),
        [squill.OperatorType.CURRENT_TIMESTAMP_2] : () => squill.functionCall(
            "substr",
            [
                squill.functionCall(
                    "strftime",
                    [
                        squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                        squill.pascalStyleEscapeString("now")
                    ]
                ),
                "1",
                "22"
            ]
        ),
        [squill.OperatorType.CURRENT_TIMESTAMP_3] : () => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                squill.pascalStyleEscapeString("now")
            ]
        ),
        [squill.OperatorType.EXTRACT_YEAR] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%Y"),
                            operands[0]
                        ]
                    ),
                    "AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.EXTRACT_MONTH] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%m"),
                            operands[0]
                        ]
                    ),
                    "AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.EXTRACT_DAY] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%d"),
                            operands[0]
                        ]
                    ),
                    "AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.EXTRACT_HOUR] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%H"),
                            operands[0]
                        ]
                    ),
                    "AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.EXTRACT_MINUTE] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%M"),
                            operands[0]
                        ]
                    ),
                    "AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.EXTRACT_INTEGER_SECOND] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%S"),
                            operands[0]
                        ]
                    ),
                    "AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.EXTRACT_FRACTIONAL_SECOND_3] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%f"),
                            operands[0]
                        ]
                    ),
                    "AS DOUBLE"
                ]
            ]
        ),
        [squill.OperatorType.LAST_DAY] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d"),
                operands[0],
                squill.pascalStyleEscapeString("+1 month"),
                [
                    squill.pascalStyleEscapeString("-"),
                    "||",
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%d"),
                            operands[0]
                        ]
                    ),
                    "||",
                    squill.pascalStyleEscapeString(" day")
                ]
            ]
        ),
        [squill.OperatorType.TIMESTAMPADD_YEAR] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                operands[1],
                [
                    operands[0],
                    "||",
                    squill.pascalStyleEscapeString(" year")
                ]
            ]
        ),
        /**
         * @todo Just use a polyfill, rather than trying to emulate with SQLite built-ins.
         * Seriously. But, for now, this actually works, which surprises me.
         */
        [squill.OperatorType.TIMESTAMPADD_MONTH] : ({operands}, toSql, sqlfier) => {
            /*
                The following gives SQLite's and JS' understanding of what
                "adding months" means. However, it is different from what
                MySQL understands as "adding months".

                Since the function is named for MySQL's `TIMESTAMPADD()`,
                we follow MySQL's convention, and emultate MySQL's behaviour.

                squill.functionCall(
                    "strftime",
                    [
                        squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                        operands[1],
                        [
                            operands[0],
                            "||",
                            squill.pascalStyleEscapeString(" month")
                        ]
                    ]
                )
            */
            const rawDeltaMonth = operands[0];
            const dateTime = operands[1];
            const curYear = sqlfier.operatorSqlfier[squill.OperatorType.EXTRACT_YEAR](
                squill.OperatorNodeUtil.operatorNode1(
                    squill.OperatorType.EXTRACT_YEAR,
                    [dateTime],
                    squill.TypeHint.DATE_TIME
                ),
                toSql,
                sqlfier
            );
            const curMonth = sqlfier.operatorSqlfier[squill.OperatorType.EXTRACT_MONTH](
                squill.OperatorNodeUtil.operatorNode1(
                    squill.OperatorType.EXTRACT_MONTH,
                    [dateTime],
                    squill.TypeHint.DATE_TIME
                ),
                toSql,
                sqlfier
            );
            const curDay = sqlfier.operatorSqlfier[squill.OperatorType.EXTRACT_DAY](
                squill.OperatorNodeUtil.operatorNode1(
                    squill.OperatorType.EXTRACT_DAY,
                    [dateTime],
                    squill.TypeHint.DATE_TIME
                ),
                toSql,
                sqlfier
            );
            const curTimeComponent = squill.functionCall(
                "strftime",
                [
                    squill.pascalStyleEscapeString(" %H:%M:%f"),
                    dateTime
                ]
            );

            function lastDay (year : squill.Ast, month : squill.Ast) {
                return squill.parentheses(
                    [
                        "CASE",
                        "WHEN", month, "= 2 THEN (CASE WHEN", year, "%4 = 0 THEN 29 ELSE 28 END)",
                        "WHEN", month, "IN(1,3,5,7,8,10,12) THEN 31",
                        "ELSE 30",
                        "END"
                    ],
                    false
                );

            }
            function setYearMonth (resultYear : squill.Ast, resultMonth : squill.Ast) {
                const lastDayOfResult = lastDay(resultYear, resultMonth);
                const lastDayOfAdd = squill.parentheses(
                    ["CASE WHEN", curDay, ">", lastDayOfResult, "THEN", lastDayOfResult, "ELSE", curDay, "END"],
                    false
                );

                /**
                 * @todo Instead of `LPAD()`, use this?
                 * https://stackoverflow.com/a/9603175
                 */
                return [
                    squill.functionCall("LPAD", [squill.functionCall("CAST", [[resultYear, "AS TEXT"]]), "4", "'0'"]),
                    "|| '-' ||",
                    squill.functionCall("LPAD", [squill.functionCall("CAST", [[resultMonth, "AS TEXT"]]), "2", "'0'"]),
                    "|| '-' ||",
                    squill.functionCall("LPAD", [squill.functionCall("CAST", [[lastDayOfAdd, "AS TEXT"]]), "2", "'0'"]),
                    "||",
                    curTimeComponent
                ];
            }

            const monthsSince_0000_01 = squill.parentheses(
                [curYear, "* 12 + (", curMonth, "-1) +", rawDeltaMonth],
                false
            );
            const resultYear = squill.functionCall("FLOOR", [[monthsSince_0000_01, "/12"]]);
            const resultMonth = squill.parentheses([monthsSince_0000_01, "%12 + 1"], false);

            return [
                "CASE",
                "WHEN", monthsSince_0000_01, "BETWEEN 0 AND 119999 THEN", setYearMonth(resultYear, resultMonth),
                "ELSE NULL",
                "END"
            ];
        },
        [squill.OperatorType.TIMESTAMPADD_DAY] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                operands[1],
                insertBetween(
                    [
                        operands[0],
                        squill.pascalStyleEscapeString(" day")
                    ],
                    "||"
                )
            ]
        ),
        [squill.OperatorType.TIMESTAMPADD_HOUR] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                operands[1],
                insertBetween(
                    [
                        operands[0],
                        squill.pascalStyleEscapeString(" hour")
                    ],
                    "||"
                )
            ]
        ),
        [squill.OperatorType.TIMESTAMPADD_MINUTE] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                operands[1],
                insertBetween(
                    [
                        operands[0],
                        squill.pascalStyleEscapeString(" minute")
                    ],
                    "||"
                )
            ]
        ),
        [squill.OperatorType.TIMESTAMPADD_SECOND] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                operands[1],
                insertBetween(
                    [
                        operands[0],
                        squill.pascalStyleEscapeString(" second")
                    ],
                    "||"
                )
            ]
        ),
        [squill.OperatorType.TIMESTAMPADD_MILLISECOND] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                operands[1],
                insertBetween(
                    [
                        squill.parentheses(
                            insertBetween(
                                [
                                    operands[0],
                                    "1000e0"
                                ],
                                "/"
                            ),
                            //canUnwrap
                            false
                        ),
                        squill.pascalStyleEscapeString(" second")
                    ],
                    "||"
                )
            ]
        ),
        [squill.OperatorType.TIMESTAMPDIFF_DAY] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%J"),
                            operands[1]
                        ]
                    ),
                    "-",
                    squill.functionCall(
                        "strftime",
                        [
                            squill.pascalStyleEscapeString("%J"),
                            operands[0]
                        ]
                    ),
                    "AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.TIMESTAMPDIFF_HOUR] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.parentheses(
                        [
                            squill.functionCall(
                                "strftime",
                                [
                                    squill.pascalStyleEscapeString("%J"),
                                    operands[1]
                                ]
                            ),
                            "-",
                            squill.functionCall(
                                "strftime",
                                [
                                    squill.pascalStyleEscapeString("%J"),
                                    operands[0]
                                ]
                            )
                        ],
                        false
                    ),
                    "* 24 AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.TIMESTAMPDIFF_MINUTE] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.parentheses(
                        [
                            squill.functionCall(
                                "strftime",
                                [
                                    squill.pascalStyleEscapeString("%J"),
                                    operands[1]
                                ]
                            ),
                            "-",
                            squill.functionCall(
                                "strftime",
                                [
                                    squill.pascalStyleEscapeString("%J"),
                                    operands[0]
                                ]
                            )
                        ],
                        false
                    ),
                    "* 24 * 60 AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.TIMESTAMPDIFF_SECOND] : ({operands}) => squill.functionCall(
            "CAST",
            [
                [
                    squill.parentheses(
                        [
                            squill.functionCall(
                                "strftime",
                                [
                                    squill.pascalStyleEscapeString("%J"),
                                    operands[1]
                                ]
                            ),
                            "-",
                            squill.functionCall(
                                "strftime",
                                [
                                    squill.pascalStyleEscapeString("%J"),
                                    operands[0]
                                ]
                            )
                        ],
                        false
                    ),
                    "* 24 * 60 * 60 AS BIGINT"
                ]
            ]
        ),
        [squill.OperatorType.TIMESTAMPDIFF_MILLISECOND] : ({operands}) => {
            /*
                This naive implementation suffers from precision problems,
                squill.functionCall(
                    "CAST",
                    [
                        [
                            squill.parentheses(
                                [
                                    squill.functionCall(
                                        "strftime",
                                        [
                                            squill.pascalStyleEscapeString("%J"),
                                            operands[1]
                                        ]
                                    ),
                                    "-",
                                    squill.functionCall(
                                        "strftime",
                                        [
                                            squill.pascalStyleEscapeString("%J"),
                                            operands[0]
                                        ]
                                    )
                                ],
                                false
                            ),
                            "* 24 * 60 * 60 * 1000 AS BIGINT"
                        ]
                    ]
                )
            */
            function castAsBigInt (x : squill.Ast) {
                return squill.functionCall("CAST", [[x, "AS BIGINT"]]);
            }
            const diffDate = [
                squill.parentheses(
                    [
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%J"),
                                squill.functionCall(
                                    "strftime",
                                    [
                                        squill.pascalStyleEscapeString("%Y-%m-%d"),
                                        operands[1]
                                    ]
                                )
                            ]
                        ),
                        "-",
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%J"),
                                squill.functionCall(
                                    "strftime",
                                    [
                                        squill.pascalStyleEscapeString("%Y-%m-%d"),
                                        operands[0]
                                    ]
                                )
                            ]
                        )
                    ],
                    false
                ),
                "* 24 * 60 * 60 * 1000"
            ];
            const diffHour = [
                squill.parentheses(
                    [
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%H"),
                                operands[1]
                            ]
                        ),
                        "-",
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%H"),
                                operands[0]
                            ]
                        )
                    ],
                    false
                ),
                "* 60 * 60 * 1000"
            ];
            const diffMinute = [
                squill.parentheses(
                    [
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%M"),
                                operands[1]
                            ]
                        ),
                        "-",
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%M"),
                                operands[0]
                            ]
                        )
                    ],
                    false
                ),
                "* 60 * 1000"
            ];
            const diffSecond = [
                squill.parentheses(
                    [
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%S"),
                                operands[1]
                            ]
                        ),
                        "-",
                        squill.functionCall(
                            "strftime",
                            [
                                squill.pascalStyleEscapeString("%S"),
                                operands[0]
                            ]
                        )
                    ],
                    false
                ),
                "* 1000"
            ];
            const diffMillisecond = [
                squill.parentheses(
                    [
                        squill.functionCall(
                            "substr",
                            [
                                squill.functionCall(
                                    "strftime",
                                    [
                                        squill.pascalStyleEscapeString("%f"),
                                        operands[1]
                                    ]
                                ),
                                "4"
                            ]
                        ),
                        "-",
                        squill.functionCall(
                            "substr",
                            [
                                squill.functionCall(
                                    "strftime",
                                    [
                                        squill.pascalStyleEscapeString("%f"),
                                        operands[0]
                                    ]
                                ),
                                "4"
                            ]
                        )
                    ],
                    false
                )
            ];
            return castAsBigInt(insertBetween(
                [
                    diffDate,
                    diffHour,
                    diffMinute,
                    diffSecond,
                    diffMillisecond
                ],
                "+"
            ));
        },
        [squill.OperatorType.UTC_STRING_TO_TIMESTAMP_CONSTRUCTOR] : ({operands}) => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                operands[0]
            ]
        ),
        [squill.OperatorType.UNIX_TIMESTAMP_NOW] : () => squill.functionCall(
            "strftime",
            [
                squill.pascalStyleEscapeString("%s"),
                squill.pascalStyleEscapeString("now")
            ]
        ),

        /*
            Cast Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/cast-functions.html
        */

        [squill.OperatorType.CAST_AS_DECIMAL] : ({operands : [arg, precision, scale]}) => squill.functionCall(
            "decimal_ctor",
            [
                arg,
                precision,
                scale
            ]
        )/*functionCall(
            "CAST",
            [
                toSql(arg) + `AS DECIMAL(${toSql(precision)}, ${toSql(scale)})`
            ]
        )*/,

        [squill.OperatorType.CAST_AS_DOUBLE] : ({operands}, toSql) => squill.functionCall("CAST", [`${toSql(operands)} AS DOUBLE`]),

        [squill.OperatorType.CAST_AS_BIGINT_SIGNED] : ({operands}, toSql) => squill.functionCall("CAST", [`${toSql(operands)} AS BIGINT`]),

        [squill.OperatorType.CAST_AS_BINARY] : ({operands}) => squill.functionCall("CAST", [[operands[0], `AS BLOB`]]),

        [squill.OperatorType.CAST_AS_VARCHAR] : ({operands}) => squill.functionCall("CAST", [[operands[0], `AS VARCHAR`]]),

        [squill.OperatorType.CAST_AS_JSON] : ({operands}) => squill.functionCall("CAST", [[operands[0], `AS TEXT`]]),

        /*
            Bit Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/bit-functions.html
        */
        [squill.OperatorType.BITWISE_AND] : ({operands}) => insertBetween(operands, "&"),
        [squill.OperatorType.BITWISE_OR] : ({operands}) => insertBetween(operands, "|"),
        [squill.OperatorType.BITWISE_XOR] : ({operands}) => [
            ["~", squill.parentheses(insertBetween(operands, "&"), false)],
            "&",
            squill.parentheses(insertBetween(operands, "|"), false)
        ],
        [squill.OperatorType.BITWISE_NOT] : ({operands}) => ["~", operands],
        [squill.OperatorType.BITWISE_LEFT_SHIFT] : ({operands}) => insertBetween(operands, "<<"),
        [squill.OperatorType.BITWISE_RIGHT_SHIFT] : ({operands}) => insertBetween(operands, ">>"),

        /*
            Aggregate (GROUP BY) Function Descriptions
            https://dev.mysql.com/doc/refman/8.0/en/group-by-functions.html
        */

        [squill.OperatorType.AGGREGATE_COUNT_ALL] : () => squill.functionCall("COUNT", ["*"]),
        [squill.OperatorType.AGGREGATE_COUNT_EXPR] : ({operands, operatorType}) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (
                    squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true
                ) {
                    return squill.functionCall("COUNT", [["DISTINCT", expr]]);
                } else {
                    return squill.functionCall("COUNT", [expr]);
                }
            } else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_AVERAGE] : ({operands, operatorType}) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (
                    squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true
                ) {
                    return squill.functionCall("AVG", [["DISTINCT", expr]]);
                } else {
                    return squill.functionCall("AVG", [expr]);
                }
            } else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_MAX] : ({operands}) => {
            return squill.functionCall("MAX", operands);
        },
        [squill.OperatorType.AGGREGATE_MIN] : ({operands}) => {
            return squill.functionCall("MIN", operands);
        },
        [squill.OperatorType.AGGREGATE_SUM] : ({operands, operatorType}) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (
                    squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true
                ) {
                    return squill.functionCall("SUM", [["DISTINCT", expr]]);
                } else {
                    return squill.functionCall("SUM", [expr]);
                }
            } else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_SUM_AS_BIGINT_SIGNED] : ({operands, operatorType}) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (
                    squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true
                ) {
                    return squill.functionCall("SUM", [["DISTINCT", expr]]);
                } else {
                    return squill.functionCall("SUM", [expr]);
                }
            } else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_SUM_AS_DECIMAL] : ({operands, operatorType}) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (
                    squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true
                ) {
                    return squill.functionCall(
                        "SUM",
                        [
                            [
                                "DISTINCT",
                                squill.functionCall("CAST", [
                                    [expr, "AS NUMERIC"]
                                ])
                            ]
                        ]
                    );
                } else {
                    return squill.functionCall(
                        "SUM",
                        [
                            squill.functionCall("CAST", [
                                [expr, "AS NUMERIC"]
                            ])
                        ]
                    );
                }
            } else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_GROUP_CONCAT_DISTINCT] : ({operands}) => squill.functionCall(
            "GROUP_CONCAT",
            [
                ["DISTINCT", operands[0]]
            ]
        ),
        [squill.OperatorType.AGGREGATE_GROUP_CONCAT_ALL] : ({operands}) => squill.functionCall(
            "GROUP_CONCAT",
            operands
        ),
        [squill.OperatorType.AGGREGATE_POPULATION_STANDARD_DEVIATION] : ({operands}) => {
            return squill.functionCall("STDDEV_POP", operands);
        },
        [squill.OperatorType.AGGREGATE_SAMPLE_STANDARD_DEVIATION] : ({operands}) => {
            return squill.functionCall("STDDEV_SAMP", operands);
        },
        [squill.OperatorType.AGGREGATE_POPULATION_VARIANCE] : ({operands}) => {
            return squill.functionCall("VAR_POP", operands);
        },
        [squill.OperatorType.AGGREGATE_SAMPLE_VARIANCE] : ({operands}) => {
            return squill.functionCall("VAR_SAMP", operands);
        },

        [squill.OperatorType.EXISTS] : ({operands : [query]}, toSql) => {
            if (squill.QueryBaseUtil.isAfterFromClause(query)) {
                //EXISTS(... FROM table)
                if (squill.QueryBaseUtil.isAfterSelectClause(query)) {
                    //EXISTS(SELECT x FROM table)
                    return squill.functionCall("EXISTS", [query]);
                } else {
                    //EXISTS(FROM table)
                    return squill.functionCall("EXISTS", [
                        "SELECT 1 " + toSql(query)
                    ]);
                }
            } else {
                if (squill.QueryBaseUtil.isAfterSelectClause(query)) {
                    //EXISTS(SELECT x)
                    return squill.functionCall("EXISTS", [query]);
                } else {
                    throw new Error(`Query should have either FROM or SELECT clause`);
                }
            }
        },

        /*
            https://dev.mysql.com/doc/refman/5.7/en/information-functions.html

            Information Functions
        */
        [squill.OperatorType.CURRENT_SCHEMA] : () => squill.pascalStyleEscapeString(DEFAULT_SCHEMA_NAME),
        [squill.OperatorType.CURRENT_USER] : () => "NULL",
        /*
            Custom library functions

            These functions are not standard SQL,
            but can be implemented using standard SQL.
        */
        [squill.OperatorType.THROW_IF_NULL] : ({operands : [arg]}) => {
            return squill.functionCall("COALESCE", [
                arg,
                THROW_AST
            ]);
        },
    },
    queryBaseSqlfier : (rawQuery, toSql) => {
        const sql = queryToSql(rawQuery, toSql, false);
        //console.log(sql);
        return sql;
    },
    caseValueSqlfier : (node) => {
        const result : squill.Ast[] = [
            "CASE", node.value,
        ];
        for (const [compareValue, thenResult] of node.cases) {
            result.push(["WHEN", compareValue, "THEN", thenResult]);
        }
        if (node.else != undefined) {
            result.push(["ELSE", node.else]);
        }
        result.push("END");
        return result;
    },
    caseConditionSqlfier : (node) => {
        const result : squill.Ast[] = [
            "CASE"
        ];
        for (const [condition, thenResult] of node.branches) {
            result.push(["WHEN", condition, "THEN", thenResult]);
        }
        if (node.else != undefined) {
            result.push(["ELSE", node.else]);
        }
        result.push("END");
        return result;
    }
};
