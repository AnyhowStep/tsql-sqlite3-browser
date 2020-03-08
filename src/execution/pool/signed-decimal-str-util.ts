import * as UnsignedDecimalStrUtil from "./unsigned-decimal-str-util";

const {unsignedDecimalStrAdd, unsignedDecimalStrSubtract} = UnsignedDecimalStrUtil;

/**
 *
 * @param {string} decimalStr
 */
export function signedDecimalStrIsPositive (decimalStr : string) {
    return decimalStr[0] != "-";
}

/**
 *
 * @param {string} a
 * @param {string} b
 */
export function signedDecimalStrGreaterThanOrEqual (a : string, b : string) : boolean {
    if (signedDecimalStrIsPositive(a)) {
        if (signedDecimalStrIsPositive(b)) {
            if (a.length > b.length) {
                return true;
            }
            if (a.length < b.length) {
                return false;
            }
            for (let i=0; i<a.length; ++i) {
                if (Number(a[i]) > Number(b[i])) {
                    return true;
                }
                if (Number(a[i]) < Number(b[i])) {
                    return false;
                }
            }
            return true;
        } else {
            //a > b
            return true;
        }
    } else {
        if (signedDecimalStrIsPositive(b)) {
            //a < b
            return false;
        } else {
            return signedDecimalStrGreaterThanOrEqual(
                b.substr(1),
                a.substr(1)
            );
        }
    }
}

/**
 *
 * @param {string} a
 * @param {string} b
 */
export function signedDecimalStrLessThanOrEqual (a : string, b : string) {
    return signedDecimalStrGreaterThanOrEqual(b, a);
}


export function signedDecimalStrSubtract (a : string, b : string) : string {
    if (a == b) {
        return "0";
    }

    if (b[0] == "-") {
        //a - negative = a + (-negative)
        return signedDecimalStrAdd(a, b.substr(1));
    }

    if (a[0] == "-") {
        //negative - b = -((-negative) + b)
        return "-" + signedDecimalStrAdd(a.substr(1), b);
    }

    if (signedDecimalStrGreaterThanOrEqual(a, b)) {
        //a > b
        return unsignedDecimalStrSubtract(a, b);
    } else {
        //a < b
        return "-" + signedDecimalStrSubtract(b, a);
    }
}

export function signedDecimalStrAdd (a : string, b : string) : string {
    if (b[0] == "-") {
        //a + negative = a - (-negative)
        return signedDecimalStrSubtract(a, b.substr(1));
    }

    if (a[0] == "-") {
        //negative + b = b - (-negative)
        const absA = a.substr(1);
        if (absA == b) {
            //-x + x = 0
            return "0";
        } else if (signedDecimalStrGreaterThanOrEqual(absA, b)) {
            //x > b
            return "-" + signedDecimalStrSubtract(absA, b);
        } else {
            //x < b
            return signedDecimalStrSubtract(b, absA);
        }
    }

    return unsignedDecimalStrAdd(a, b);
}
