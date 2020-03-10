import * as squill from "@squill/squill";
import {sqlfier} from "./sqlfier";

/**
 * Returns an unprettified SQL string.
 * Is fast-ish.
 *
 * @param ast - The AST to convert to a SQL string
 * @see {toSqlPretty} for pretty output but slower performance.
 */
export function toSql (ast : squill.Ast) : string {
    return squill.AstUtil.toSql(ast, sqlfier);
}

/**
 * Returns a prettified SQL string.
 * Is slow-ish.
 *
 * @param ast - The AST to convert to a SQL string
 * @see {toSql} for ugly output but faster performance.
 */
export function toSqlPretty (ast : squill.Ast) : string {
    return squill.AstUtil.toSqlPretty(
        ast,
        sqlfier,
        {
            stringTypes : [/*`""`,*/ "N''", /*"''",*/ "``", "[]", "X''", "pascal-single", "pascal-double"],
            /**
             * These `undefined` values should be ignored,
             * and should not overwrite.
             */
            openParens : undefined,
            closeParens : undefined,
        }
    );
}
