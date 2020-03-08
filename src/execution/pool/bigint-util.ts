import * as SignedDecimalStrUtil from "./signed-decimal-str-util";

const {
    signedDecimalStrLessThanOrEqual,
    signedDecimalStrGreaterThanOrEqual,
    signedDecimalStrAdd,
    signedDecimalStrSubtract,
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
