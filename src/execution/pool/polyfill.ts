import {Connection} from "../connection";
import {initDecimalPolyfill} from "./decimal-polyfill";
import {initBigIntPolyfill} from "./bigint-polyfill";

declare const isBigInt : (x : unknown) => x is bigint;

declare function btoa (blob : string) : string;
declare function atob (base64Str : string) : string;

declare function signedDecimalStrToBinaryStr (decimalStr : string) : string;
declare function binaryStrSetWidth (binaryStr : string, width : number) : string;

export async function initPolyfill (
    connection : Connection
) {
    await initDecimalPolyfill(connection);
    await initBigIntPolyfill(connection);
    await connection.createFunction("ASCII", (x) => {
        if (typeof x == "string") {
            if (x == "") {
                return 0;
            }
            return x.charCodeAt(0);
        } else {
            throw new Error(`ASCII only implemented for string`);
        }
    });
    await connection.createFunction("BIN", (x) => {
        if (isBigInt(x)) {
            const str = x.toString();
            if (str[0] == "-") {
                return binaryStrSetWidth(
                    signedDecimalStrToBinaryStr(str),
                    64
                );
            } else {
                //substr to remove leading 0
                return signedDecimalStrToBinaryStr(str).substr(1);
            }
            /*
            if (tm.BigIntUtil.greaterThanOrEqual(x, 0)) {
                return tm.BigIntUtil.toString(
                    x,
                    2
                );
            } else {
                return tm.BigIntUtil.toString(
                    tm.BigIntUtil.add(
                        tm.BigIntUtil.leftShift(tm.BigInt(1), 64),
                        x
                    ),
                    2
                );
            }
            */
        } else {
            throw new Error(`BIN only implemented for bigint`);
        }
    });
    await connection.createVarArgFunction("CONCAT_WS", (separator, ...args) => {
        if (typeof separator == "string") {
            return args.filter(arg => arg !== null).join(separator);
        } else {
            throw new Error(`CONCAT_WS only implemented for string`);
        }
    });
    await connection.createFunction("FROM_BASE64", (x) => {
        if (typeof x == "string") {
            const result = new Uint8Array(
                atob(x).split("").filter(s => s != "").map(s => s.charCodeAt(0))
            );
            return result;
        } else {
            throw new Error(`FROM_BASE64 only implemented for string`);
        }
    });
    await connection.createFunction("LPAD", (str, len, pad) => {
        if (
            typeof str == "string" &&
            isBigInt(len) &&
            typeof pad == "string"
        ) {
            if (str.length > Number(len)) {
                return str.substr(0, Number(len));
            } else if (str.length == Number(len)) {
                return str;
            } else {
                return str.padStart(Number(len), pad);
            }
        } else {
            throw new Error(`LPAD only implemented for (string, bigint, string)`);
        }
    });
    await connection.createFunction("RPAD", (str, len, pad) => {
        if (
            typeof str == "string" &&
            isBigInt(len) &&
            typeof pad == "string"
        ) {
            if (str.length > Number(len)) {
                return str.substr(0, Number(len));
            } else if (str.length == Number(len)) {
                return str;
            } else {
                return str.padEnd(Number(len), pad);
            }
        } else {
            throw new Error(`RPAD only implemented for (string, bigint, string)`);
        }
    });
    await connection.createFunction("REPEAT", (str, count) => {
        if (
            typeof str == "string" &&
            isBigInt(count)
        ) {
            if (Number(count) < 0) {
                return "";
            }
            return str.repeat(Number(count));
        } else {
            throw new Error(`REPEAT only implemented for (string, bigint)`);
        }
    });
    await connection.createFunction("REVERSE", (str) => {
        if (
            typeof str == "string"
        ) {
            return [...str].reverse().join("");
        } else {
            throw new Error(`REVERSE only implemented for (string)`);
        }
    });
    await connection.createFunction("TO_BASE64", (blob) => {
        if (
            blob instanceof Uint8Array
        ) {
            return btoa([...blob].map(n => String.fromCharCode(n)).join(""));
        } else {
            throw new Error(`TO_BASE64 only implemented for (Uint8Array)`);
        }
    });
    await connection.createFunction("UNHEX", (x) => {
        if (typeof x == "string") {
            const matches = x.match(/.{2}/g);
            if (matches == undefined) {
                throw new Error(`Invalid Hex string`);
            }
            const result = new Uint8Array(matches.map(str => parseInt(str, 16)));
            const hexResult = [...result].map((n) => ("00" + n.toString(16)).slice(-2)).join("");
            if (x.toUpperCase() == hexResult.toUpperCase()) {
                return result;
            } else {
                throw new Error(`Invalid Hex string`);
            }
        } else {
            throw new Error(`UNHEX only implemented for string`);
        }
    });
    await connection.createFunction("FLOOR", (x) => {
        if (isBigInt(x)) {
            return x;
        } else if (typeof x == "number") {
            return Math.floor(x);
        } else {
            throw new Error(`Can only FLOOR bigint or double`);
        }
    });
    await connection.createFunction("CEILING", (x) => {
        if (isBigInt(x)) {
            return x;
        } else if (typeof x == "number") {
            return Math.ceil(x);
        } else {
            throw new Error(`Can only CEILING bigint or double`);
        }
    });
    await connection.createFunction("CBRT", (x) => {
        if (typeof x == "number") {
            return Math.cbrt(x);
        } else {
            throw new Error(`CBRT(${typeof x}) not implmented`);
        }
    });
    await connection.createFunction("COT", (x) => {
        if (typeof x == "number") {
            const divisor = Math.cos(x);
            const dividend = Math.sin(x);
            if (dividend == 0) {
                return null;
            } else {
                return divisor/dividend;
            }
        } else {
            throw new Error(`COT(${typeof x}) not implmented`);
        }
    });
    await connection.createFunction("LN", (x) => {
        if (typeof x == "number") {
            if (x == 0) {
                return null;
            }
            const result = Math.log(x);
            return result;
        } else {
            throw new Error(`LN(${typeof x}) not implmented`);
        }
    });
    await connection.createFunction("LOG", (x, y) => {
        if (typeof x == "number" && typeof y == "number") {
            if (x <= 0 || x == 1) {
                return null;
            }
            if (y == 0) {
                return null;
            }
            return Math.log(y) / Math.log(x);
        } else {
            throw new Error(`LOG(${typeof x}, ${typeof y}) not implmented`);
        }
    });
    await connection.createFunction("LOG2", (x) => {
        if (typeof x == "number") {
            if (x == 0) {
                return null;
            }
            const result = Math.log2(x);
            return result;
        } else {
            throw new Error(`LOG2(${typeof x}) not implmented`);
        }
    });
    await connection.createFunction("LOG10", (x) => {
        if (typeof x == "number") {
            if (x == 0) {
                return null;
            }
            const result = Math.log10(x);
            return result;
        } else {
            throw new Error(`LOG10(${typeof x}) not implmented`);
        }
    });
    await connection.createFunction("FRANDOM", () => {
        return Math.random();
    });
    await connection.createAggregate(
        "STDDEV_POP",
        () => {
            return {
                values : [] as number[],
            };
        },
        (state, x) => {
            if (x === null) {
                return;
            }
            if (typeof x == "number") {
                state.values.push(x);
            } else {
                throw new Error(`STDDEV_POP(${typeof x}) not implmented`);
            }
        },
        (state) => {
            if (state == undefined) {
                return null;
            }
            if (state.values.length == 0) {
                return null;
            }
            const sum = state.values.reduce(
                (sum, value) => sum + value,
                0
            );
            const count = state.values.length;
            const avg = sum/count;
            const squaredErrors = state.values.map(value => {
                return Math.pow(value - avg, 2);
            });
            const sumSquaredErrors = squaredErrors.reduce(
                (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                0
            );
            return Math.sqrt(
                sumSquaredErrors / count
            );
        }
    );
    await connection.createAggregate(
        "STDDEV_SAMP",
        () => {
            return {
                values : [] as number[],
            };
        },
        (state, x) => {
            if (x === null) {
                return;
            }
            if (typeof x == "number") {
                state.values.push(x);
            } else {
                throw new Error(`STDDEV_SAMP(${typeof x}) not implmented`);
            }
        },
        (state) => {
            if (state == undefined) {
                return null;
            }
            if (state.values.length == 0) {
                return null;
            }
            if (state.values.length == 1) {
                return null;
            }
            const sum = state.values.reduce(
                (sum, value) => sum + value,
                0
            );
            const count = state.values.length;
            const avg = sum/count;
            const squaredErrors = state.values.map(value => {
                return Math.pow(value - avg, 2);
            });
            const sumSquaredErrors = squaredErrors.reduce(
                (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                0
            );
            return Math.sqrt(
                sumSquaredErrors / (count-1)
            );
        }
    );
    await connection.createAggregate(
        "VAR_POP",
        () => {
            return {
                values : [] as number[],
            };
        },
        (state, x) => {
            if (x === null) {
                return;
            }
            if (typeof x == "number") {
                state.values.push(x);
            } else {
                throw new Error(`VAR_POP(${typeof x}) not implmented`);
            }
        },
        (state) => {
            if (state == undefined) {
                return null;
            }
            if (state.values.length == 0) {
                return null;
            }
            const sum = state.values.reduce(
                (sum, value) => sum + value,
                0
            );
            const count = state.values.length;
            const avg = sum/count;
            const squaredErrors = state.values.map(value => {
                return Math.pow(value - avg, 2);
            });
            const sumSquaredErrors = squaredErrors.reduce(
                (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                0
            );
            return sumSquaredErrors / count;
        }
    );
    await connection.createAggregate(
        "VAR_SAMP",
        () => {
            return {
                values : [] as number[],
            };
        },
        (state, x) => {
            if (x === null) {
                return;
            }
            if (typeof x == "number") {
                state.values.push(x);
            } else {
                throw new Error(`VAR_SAMP(${typeof x}) not implmented`);
            }
        },
        (state) => {
            if (state == undefined) {
                return null;
            }
            if (state.values.length == 0) {
                return null;
            }
            if (state.values.length == 1) {
                return null;
            }
            const sum = state.values.reduce(
                (sum, value) => sum + value,
                0
            );
            const count = state.values.length;
            const avg = sum/count;
            const squaredErrors = state.values.map(value => {
                return Math.pow(value - avg, 2);
            });
            const sumSquaredErrors = squaredErrors.reduce(
                (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                0
            );
            return sumSquaredErrors / (count-1);
        }
    );
}
