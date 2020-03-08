import {Connection} from "../connection";
import * as UnsignedDecimalStrUtil from "./unsigned-decimal-str-util";
import * as SignedDecimalStrUtil from "./signed-decimal-str-util";
import * as BigIntUtil from "./bigint-util";

const {
    unsignedDigitArrayAdd,
    unsignedDecimalStrAdd,
    unsignedDecimalStrSubtract,
    unsignedDecimalStrMultiply,
} = UnsignedDecimalStrUtil;

const {
    signedDecimalStrLessThanOrEqual,
    signedDecimalStrGreaterThanOrEqual,
    signedDecimalStrAdd,
    signedDecimalStrSubtract,
    signedDecimalStrMultiply,
} = SignedDecimalStrUtil;

const {
    isSafeBigIntSigned,
    assertSafeBigIntSigned,
    bigIntAdd,
    bigIntSubtract,
    bigIntUnaryMinus,
    bigIntMultiply,
} = BigIntUtil;

declare const isBigInt : (x : unknown) => x is bigint;

export async function initBigIntPolyfill (
    connection : Connection
) {
    await connection.createGlobalJsFunction("unsignedDigitArrayAdd", unsignedDigitArrayAdd);
    await connection.createGlobalJsFunction("unsignedDecimalStrAdd", unsignedDecimalStrAdd);
    await connection.createGlobalJsFunction("unsignedDecimalStrSubtract", unsignedDecimalStrSubtract);
    await connection.createGlobalJsFunction("unsignedDecimalStrMultiply", unsignedDecimalStrMultiply);

    await connection.createGlobalJsFunction("signedDecimalStrLessThanOrEqual", signedDecimalStrLessThanOrEqual);
    await connection.createGlobalJsFunction("signedDecimalStrGreaterThanOrEqual", signedDecimalStrGreaterThanOrEqual);
    await connection.createGlobalJsFunction("signedDecimalStrAdd", signedDecimalStrAdd);
    await connection.createGlobalJsFunction("signedDecimalStrSubtract", signedDecimalStrSubtract);
    await connection.createGlobalJsFunction("signedDecimalStrMultiply", signedDecimalStrMultiply);

    await connection.createGlobalJsFunction("isSafeBigIntSigned", isSafeBigIntSigned);
    await connection.createGlobalJsFunction("assertSafeBigIntSigned", assertSafeBigIntSigned);
    await connection.createGlobalJsFunction("bigIntAdd", bigIntAdd);
    await connection.createGlobalJsFunction("bigIntSubtract", bigIntSubtract);
    await connection.createGlobalJsFunction("bigIntUnaryMinus", bigIntUnaryMinus);
    await connection.createGlobalJsFunction("bigIntMultiply", bigIntMultiply);

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
        if (arr.length == 0) {
            return BigInt(1);
        }
        if (arr.length == 1) {
            const a = arr[0];
            if (isBigInt(a)) {
                return a;
            } else {
                throw new Error(`Cannot multiply non-bigint`);
            }
        }
        const [a, b, ...rest] = arr;

        if (!isBigInt(a) || !isBigInt(b)) {
            throw new Error(`Cannot multiply non-bigint`);
        }

        const product = bigIntMultiply(a, b);

        return rest.reduce<bigint>(
            (result, x) => {
                if (!isBigInt(x)) {
                    throw new Error(`Cannot multiply non-bigint`);
                }
                return bigIntMultiply(result, x);
            },
            product
        );
    });
    await connection.createFunction("bigint_neg", (a) => {
        if (!isBigInt(a)) {
            throw new Error(`Cannot unary minus non-bigint`);
        }
        return bigIntUnaryMinus(a);
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
