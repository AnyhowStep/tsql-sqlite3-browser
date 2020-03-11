import {Connection} from "../connection";
import * as FixedPointUtil from "./fixed-point-util";
import * as FloatingPointUtil from "./floating-point-util";

const {tryParseFixedPoint} = FixedPointUtil;
const {tryParseFloatingPoint, floatingPointToIntegerAndExponent} = FloatingPointUtil;

declare const isBigInt : (x : unknown) => x is bigint;

export async function initDecimalPolyfill (
    connection : Connection
) {
    await connection.createGlobalJsFunction("tryParseFloatingPoint", tryParseFloatingPoint);
    await connection.createGlobalJsFunction("floatingPointToIntegerAndExponent", floatingPointToIntegerAndExponent);

    await connection.createGlobalJsFunction("tryParseFixedPoint", tryParseFixedPoint);

    await connection.createFunction("decimal_ctor", { isVarArg : false, isDeterministic : true }, (x, precision, scale) => {
        if (
            !isBigInt(precision) ||
            !isBigInt(scale)
        ) {
            throw new Error(`Precision and scale must be bigint`);
        }

        const maxPrecision = Number(precision);
        const maxScale = Number(scale);

        if (maxPrecision < 1) {
            throw new Error(`Precision cannot be less than 1`);
        }

        if (maxScale < 0) {
            throw new Error(`Scale cannot be less than 0`);
        }

        if (maxScale > maxPrecision) {
            throw new Error(`Scale cannot be greater than precision`);
        }

        if (
            !isBigInt(x) &&
            typeof x != "number" &&
            typeof x != "string"
        ) {
            throw new Error(`Cannot cast ${typeof x} to DECIMAL(${precision}, ${scale})`);
        }

        const str = String(x);

        const parsed = tryParseFixedPoint(str);
        if (parsed == undefined) {
            throw new Error(`Could not cast to DECIMAL(${precision}, ${scale}); invalid fixed point format`);
        }

        const curScale = (
            parsed.getFixedPointFractionalPartString() == "0" ?
            0 :
            parsed.getFixedPointFractionalPartString().length
        );
        const curPrecision = (
            curScale +
            (
                parsed.getFixedPointIntegerPartString() == "0" ?
                0 :
                parsed.getFixedPointIntegerPartString().length
            )
        );

        if (curPrecision > maxPrecision) {
            throw new Error(`DECIMAL(${precision}, ${scale}) precision pverflow`);
        }
        if (curScale > maxScale) {
            throw new Error(`DECIMAL(${precision}, ${scale}) scale pverflow`);
        }

        return parsed.getFixedPointString();
    });
}
