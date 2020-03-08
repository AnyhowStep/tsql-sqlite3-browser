import {Connection} from "../connection";
import * as UnsignedDecimalStrUtil from "./unsigned-decimal-str-util";
import * as SignedDecimalStrUtil from "./signed-decimal-str-util";
import * as BigIntUtil from "./bigint-util";

const {
    unsignedDecimalStrAdd,
    unsignedDecimalStrSubtract,
} = UnsignedDecimalStrUtil;

const {
    signedDecimalStrLessThanOrEqual,
    signedDecimalStrGreaterThanOrEqual,
    signedDecimalStrAdd,
    signedDecimalStrSubtract,
} = SignedDecimalStrUtil;

const {
    isSafeBigIntSigned,
    assertSafeBigIntSigned,
    bigIntAdd,
    bigIntSubtract,
} = BigIntUtil;

declare const isBigInt : (x : unknown) => x is bigint;

export async function initBigIntPolyfill (
    connection : Connection
) {
    await connection.createGlobalJsFunction("unsignedDecimalStrAdd", unsignedDecimalStrAdd);
    await connection.createGlobalJsFunction("unsignedDecimalStrSubtract", unsignedDecimalStrSubtract);

    await connection.createGlobalJsFunction("signedDecimalStrLessThanOrEqual", signedDecimalStrLessThanOrEqual);
    await connection.createGlobalJsFunction("signedDecimalStrGreaterThanOrEqual", signedDecimalStrGreaterThanOrEqual);
    await connection.createGlobalJsFunction("signedDecimalStrAdd", signedDecimalStrAdd);
    await connection.createGlobalJsFunction("signedDecimalStrSubtract", signedDecimalStrSubtract);

    await connection.createGlobalJsFunction("isSafeBigIntSigned", isSafeBigIntSigned);
    await connection.createGlobalJsFunction("assertSafeBigIntSigned", assertSafeBigIntSigned);
    await connection.createGlobalJsFunction("bigIntAdd", bigIntAdd);
    await connection.createGlobalJsFunction("bigIntSubtract", bigIntSubtract);

    await connection.createVarArgFunction("bigint_add", (...arr) => {
        if (arr.length == 0) {
            return BigInt(0);
        }
        if (arr.length == 1) {
            const a = arr[0];
            if (isBigInt(a)) {
                return a;
            } else {
                throw new Error(`Cannot add non-bigint`);
            }
        }
        const [a, b, ...rest] = arr;

        if (!isBigInt(a) || !isBigInt(b)) {
            throw new Error(`Cannot add non-bigint`);
        }

        const sum = bigIntAdd(a, b);

        return rest.reduce<bigint>(
            (result, x) => {
                if (!isBigInt(x)) {
                    throw new Error(`Cannot add non-bigint`);
                }
                return bigIntAdd(result, x);
            },
            sum
        );
    });
    await connection.createFunction("bigint_sub", (a, b) => {
        if (!isBigInt(a) || !isBigInt(b)) {
            throw new Error(`Cannot subtract non-bigint`);
        }

        return bigIntSubtract(a, b);
    });
    await connection.createVarArgFunction("bigint_mul", (...arr) => {
        return BigInt(arr.reduce<number>(
            (result, x) => result * Number(x),
            1
        ));
        /*
        if (isBigInt(a) && isBigInt(b)) {
            const result = tm.BigIntUtil.mul(a, b);
            if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                throw new Error(`DataOutOfRangeError: bigint_mul result was ${String(result)}`);
            }
            if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                throw new Error(`DataOutOfRangeError: bigint_mul result was ${String(result)}`);
            }
            return result;
        } else {
            throw new Error(`Can only mul two bigint values`);
        }
        */
    });
    await connection.createFunction("bigint_neg", (a) => {
        return BigInt(-Number(a));
        /*
        if (isBigInt(a)) {
            const result = tm.BigIntUtil.sub(0, a);
            if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                throw new Error(`DataOutOfRangeError: bigint_neg result was ${String(result)}`);
            }
            if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                throw new Error(`DataOutOfRangeError: bigint_neg result was ${String(result)}`);
            }
            return result;
        } else {
            throw new Error(`Can only neg bigint values`);
        }
        */
    });
    await connection.createFunction("bigint_div", (a, b) => {
        return BigInt(Math.floor(Number(a) / Number(b)));
        /*
        if (isBigInt(a) && isBigInt(b)) {
            if (tm.BigIntUtil.equal(b, tm.BigInt(0))) {
                throw new Error(`DivideByZeroError: Cannot divide by zero`);
            }
            const result = tm.BigIntUtil.div(a, b);
            if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                throw new Error(`DataOutOfRangeError: bigint_div result was ${String(result)}`);
            }
            if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                throw new Error(`DataOutOfRangeError: bigint_div result was ${String(result)}`);
            }
            return result;
        } else {
            throw new Error(`Can only div two bigint values`);
        }
        */
    });
}
