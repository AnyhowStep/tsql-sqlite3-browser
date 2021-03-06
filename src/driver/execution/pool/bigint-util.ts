import * as SignedDecimalStrUtil from "./signed-decimal-str-util";

const {
    signedDecimalStrLessThanOrEqual,
    signedDecimalStrGreaterThanOrEqual,
    signedDecimalStrAdd,
    signedDecimalStrSubtract,
    signedDecimalStrMultiply,
    signedDecimalStrDivide,
} = SignedDecimalStrUtil;

export function isSafeBigIntSigned (x : bigint|string) {
    const MAX_SAFE_BIGINT_SIGNED = "9223372036854775807";
    const MIN_SAFE_BIGINT_SIGNED = "-9223372036854775808";

    if (typeof x == "bigint") {
        return (
            x <= BigInt(MAX_SAFE_BIGINT_SIGNED) &&
            x >= BigInt(MIN_SAFE_BIGINT_SIGNED)
        );
    }

    return (
        signedDecimalStrLessThanOrEqual(x, MAX_SAFE_BIGINT_SIGNED) &&
        signedDecimalStrGreaterThanOrEqual(x, MIN_SAFE_BIGINT_SIGNED)
    );
}

export function assertSafeBigIntSigned (x : bigint|string) {
    if (!isSafeBigIntSigned(x)) {
        throw new RangeError(`BIGINT SIGNED overflow`);
    }
}

export function bigIntAdd (a : bigint, b : bigint) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        const result = a + b;
        assertSafeBigIntSigned(result);
        return result;
    }

    const result = signedDecimalStrAdd(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}

export function bigIntSubtract (a : bigint, b : bigint) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        const result = a - b;
        assertSafeBigIntSigned(result);
        return result;
    }

    const result = signedDecimalStrSubtract(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}

export function bigIntUnaryMinus (a : bigint) {
    if (typeof a == "bigint") {
        const result = -a;
        assertSafeBigIntSigned(result);
        return result;
    }

    const str = String(a);
    if (str == "0") {
        return BigInt("0");
    }
    const result = (
        str[0] == "-" ?
        str.substr(1) :
        "-" + str
    );

    assertSafeBigIntSigned(result);
    return BigInt(result);
}

export function bigIntMultiply (a : bigint, b : bigint) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        const result = a * b;
        assertSafeBigIntSigned(result);
        return result;
    }

    const result = signedDecimalStrMultiply(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}

export function bigIntDivide (a : bigint, b : bigint) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        if (b == BigInt(0)) {
            throw new Error(`DivideByZeroError: Cannot divide by zero`);
        }
        const result = a / b;
        assertSafeBigIntSigned(result);
        return result;
    }

    const result = signedDecimalStrDivide(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}
