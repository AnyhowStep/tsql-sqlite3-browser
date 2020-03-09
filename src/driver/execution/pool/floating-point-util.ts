
export interface ParseFloatingPointResult {
    /**
     * Tells you if the number is positive or negative
     */
    isNegative: boolean,
    /**
     * All leading zeroes are trimmed.
     * If the numeric value is zero, this is the string `"0"`.
     */
    integerPart: string,
    /**
     * All trailing zeroes are trimmed.
     * If the numeric value is zero, this is the string `"0"`.
     */
    fractionalPart: string,
    /**
     * Tells you if this number is zero
     */
    isZero: boolean,
    /**
     * This value may be very small, or very large.
     * It may also just be zero.
     */
    exponentValue: number,
}

export function tryParseFloatingPoint (str: string) : undefined|ParseFloatingPointResult {
    const floatingPointRegex = /^([-+])?([0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)([eE]([-+])?([0-9]+))?$/;

    const m = floatingPointRegex.exec(str);
    if (m == undefined) {
        return undefined;
    }
    //-123.456e+789
    //~
    const rawCoefficientSign: string | undefined = m[1];
    //-123.456e+789
    // ~~~~~~~
    const rawCoefficientValue: string = m[2];
    //-123.456e+789
    //         ~
    const rawExponentSign: string | undefined = m[4];
    //-123.456e+789
    //          ~~~
    const rawExponentValue: string | undefined = m[5];

    const rawDecimalPlaceIndex = rawCoefficientValue.indexOf(".");

    const rawIntegerPart = (
        rawDecimalPlaceIndex < 0 ?
        rawCoefficientValue :
        rawCoefficientValue.substring(0, rawDecimalPlaceIndex)
    );
    const rawFractionalPart = (
        rawDecimalPlaceIndex < 0 ?
        "" :
        rawCoefficientValue.substring(
            rawDecimalPlaceIndex + 1,
            rawCoefficientValue.length
        )
    );

    const trimmedIntegerPart = rawIntegerPart.replace(/^(0+)/, "");
    const integerPart = (
        trimmedIntegerPart == "" ?
        "0" :
        trimmedIntegerPart
    );

    const trimmedFractionalPart = rawFractionalPart.replace(/(0+)$/, "");
    const fractionalPart = (
        trimmedFractionalPart == "" ?
        "0" :
        trimmedFractionalPart
    );

    const isZero = (integerPart == "0" && fractionalPart == "0");

    function safeCastToNumber (str : string) {
        const result = Number(str);
        if (result.toString() != str) {
            throw new Error(`Cannot cast exponent to number`);
        }
        return result;
    }

    const exponentValue = (
        isZero ?
        0 :
        rawExponentValue == undefined ?
        0 :
        rawExponentSign === "-" ?
        -safeCastToNumber(rawExponentValue) :
        safeCastToNumber(rawExponentValue)
    );
    return {
        isNegative : (rawCoefficientSign === "-"),
        integerPart,
        fractionalPart,
        isZero,
        exponentValue,
    }
}


/**
 * Converts the fractional part to an integer part,
 * by lowering the exponent
 */
export function floatingPointToIntegerAndExponent (
    arg : ParseFloatingPointResult
) : ParseFloatingPointResult {
    if (arg.fractionalPart == "0") {
        return arg;
    }

    const exponentValue = (
        arg.exponentValue -
        arg.fractionalPart.length
    );
    const integerPart = (
        arg.integerPart == "0" ?
        arg.fractionalPart.replace(/^(0+)/, "") :
        arg.integerPart + arg.fractionalPart
    );
    return {
        isNegative : arg.isNegative,
        integerPart,
        fractionalPart: "0",
        isZero : arg.isZero,
        exponentValue,
    };
}
