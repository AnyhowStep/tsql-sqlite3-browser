import * as FloatingPointUtil from "./floating-point-util";

const {
    tryParseFloatingPoint,
    floatingPointToIntegerAndExponent
} = FloatingPointUtil;

export interface ParseFixedPointResult {
    isInteger : boolean,
    isNegative: boolean,
    isZero: boolean,
    /**
     * Given `DECIMAL(precision, scale)`,
     * + precision = fixedPointFractionalLength + fixedPointIntegerLength
     * + scale     = fixedPointFractionalLength
     */
    fixedPointIntegerPartLength: number,
    fixedPointFractionalPartLength: number,
    /**
     * The length of the fixed-point string.
     */
    fixedPointLength: number,
    /**
     * These are methods because the string may be **very** long.
     * For example, expanding `1e999999999999999999999999999999`
     * into a fixed-point string
     * will probably just give you an out-of-memory exception.
     *
     * So, you should check the length of the string
     * before you get its string value!
     */
    getFixedPointIntegerPartString: () => string,
    getFixedPointFractionalPartString: () => string,
    getFixedPointString: () => string,
}
/**
 * @todo Make `getXxx()` functions cache results
 */
export function tryParseFixedPoint (str : string) : undefined|ParseFixedPointResult {
    const parsed = tryParseFloatingPoint(str);
    if (parsed == undefined) {
        return undefined;
    }
    const {
        isNegative,
        integerPart,
        isZero,
        exponentValue,
    } = floatingPointToIntegerAndExponent(parsed);

    function lazyInit<T> (initDelegate : () => T) : () => T {
        let initialized = false;
        let value : T|undefined = undefined;
        return () : T => {
            if (!initialized) {
                value = initDelegate();
                initialized = true;
            }
            return value!;
        };
    }

    if (isZero) {
        const fixedPointIntegerPartLength = 1;
        const fixedPointFractionalPartLength = 1;
        const fixedPointLength = (
            (isNegative ? 1 : 0) +
            fixedPointIntegerPartLength +
            1 +
            fixedPointFractionalPartLength
        );
        const getFixedPointIntegerPartString = () => "0";
        const getFixedPointFractionalPartString = () => "0";
        const getFixedPointString = lazyInit(() => {
            const sign = isNegative ? "-" : "";
            return (
                sign +
                getFixedPointIntegerPartString() +
                "." +
                getFixedPointFractionalPartString()
            );
        });
        return {
            isInteger : true,
            isNegative,
            isZero,
            fixedPointIntegerPartLength,
            fixedPointFractionalPartLength,
            fixedPointLength,
            getFixedPointIntegerPartString,
            getFixedPointFractionalPartString,
            getFixedPointString,
        }
    }

    if (exponentValue >= 0) {
        const fixedPointIntegerPartLength = integerPart.length + exponentValue;
        const fixedPointFractionalPartLength = 1;
        const fixedPointLength = (
            (isNegative ? 1 : 0) +
            fixedPointIntegerPartLength +
            1 +
            fixedPointFractionalPartLength
        );
        const getFixedPointIntegerPartString = lazyInit(() => (
            integerPart + "0".repeat(exponentValue)
        ));
        const getFixedPointFractionalPartString = () => "0";
        const getFixedPointString = lazyInit(() => {
            const sign = isNegative ? "-" : "";
            return (
                sign +
                getFixedPointIntegerPartString() +
                "." +
                getFixedPointFractionalPartString()
            );
        });
        return {
            isInteger : true,
            isNegative,
            isZero,
            fixedPointIntegerPartLength,
            fixedPointFractionalPartLength,
            fixedPointLength,
            getFixedPointIntegerPartString,
            getFixedPointFractionalPartString,
            getFixedPointString,
        }
    } else {
        const fractionalOffset = -exponentValue;
        if (fractionalOffset < integerPart.length) {
            const newIntegerPart = integerPart.substring(
                0,
                integerPart.length - fractionalOffset
            );
            let newFractionalPart = integerPart.substring(
                integerPart.length - fractionalOffset,
                integerPart.length
            ).replace(/(0+)$/, "");
            if (newFractionalPart == "") {
                newFractionalPart = "0";
            }

            const fixedPointIntegerPartLength = newIntegerPart.length;
            const fixedPointFractionalPartLength = newFractionalPart.length;
            const fixedPointLength = (
                (isNegative ? 1 : 0) +
                fixedPointIntegerPartLength +
                1 +
                fixedPointFractionalPartLength
            );
            const getFixedPointIntegerPartString = () => newIntegerPart;
            const getFixedPointFractionalPartString = () => newFractionalPart;
            const getFixedPointString = lazyInit(() => {
                const sign = isNegative ? "-" : "";
                return (
                    sign +
                    getFixedPointIntegerPartString() +
                    "." +
                    getFixedPointFractionalPartString()
                );
            });
            return {
                isInteger : (newFractionalPart == "0"),
                isNegative,
                isZero,
                fixedPointIntegerPartLength,
                fixedPointFractionalPartLength,
                fixedPointLength,
                getFixedPointIntegerPartString,
                getFixedPointFractionalPartString,
                getFixedPointString,
            }
        } else if (fractionalOffset == integerPart.length) {
            let newFractionalPart = integerPart.replace(/(0+)$/, "");
            if (newFractionalPart == "") {
                newFractionalPart = "0";
            }

            const fixedPointIntegerPartLength = 1;
            const fixedPointFractionalPartLength = newFractionalPart.length;
            const fixedPointLength = (
                (isNegative ? 1 : 0) +
                fixedPointIntegerPartLength +
                1 +
                fixedPointFractionalPartLength
            );
            const getFixedPointIntegerPartString = () => (
                "0"
            );
            const getFixedPointFractionalPartString = () => newFractionalPart;
            const getFixedPointString = lazyInit(() => {
                const sign = isNegative ? "-" : "";
                return (
                    sign +
                    getFixedPointIntegerPartString() +
                    "." +
                    getFixedPointFractionalPartString()
                );
            });
            return {
                isInteger : (newFractionalPart == "0"),
                isNegative,
                isZero,
                fixedPointIntegerPartLength,
                fixedPointFractionalPartLength,
                fixedPointLength,
                getFixedPointIntegerPartString,
                getFixedPointFractionalPartString,
                getFixedPointString,
            }
        } else {
            let leadingZeroCount = fractionalOffset - integerPart.length;
            let newFractionalPart = integerPart.replace(/(0+)$/, "");
            if (newFractionalPart == "") {
                leadingZeroCount = 0;
                newFractionalPart = "0";
            }

            const fixedPointIntegerPartLength = 1;
            const fixedPointFractionalPartLength = leadingZeroCount + newFractionalPart.length;
            const fixedPointLength = (
                (isNegative ? 1 : 0) +
                fixedPointIntegerPartLength +
                1 +
                fixedPointFractionalPartLength
            );
            const getFixedPointIntegerPartString = () => (
                "0"
            );
            const getFixedPointFractionalPartString = lazyInit(() => (
                "0".repeat(leadingZeroCount) +
                newFractionalPart
            ));
            const getFixedPointString = lazyInit(() => {
                const sign = isNegative ? "-" : "";
                return (
                    sign +
                    getFixedPointIntegerPartString() +
                    "." +
                    getFixedPointFractionalPartString()
                );
            });
            return {
                isInteger : (newFractionalPart == "0"),
                isNegative,
                isZero,
                fixedPointIntegerPartLength,
                fixedPointFractionalPartLength,
                fixedPointLength,
                getFixedPointIntegerPartString,
                getFixedPointFractionalPartString,
                getFixedPointString,
            }
        }
    }
}
