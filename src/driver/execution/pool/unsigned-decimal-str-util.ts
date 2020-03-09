export function unsignedDigitArrayAdd (numA : number[], numB : number[]) : number[] {
    const result : number[] = [];

    let carry = 0;
    for (let i=0; i<Math.max(numA.length, numB.length); ++i) {
        carry += (
            i < numA.length ?
            numA[numA.length-i-1] :
            0
        );
        carry += (
            i < numB.length ?
            numB[numB.length-i-1] :
            0
        );

        const digit = carry%10;
        carry = Math.floor(carry/10);

        result.unshift(digit);
    }

    if (carry != 0) {
        result.unshift(carry);
    }

    return result;
}

export function unsignedDigitArraySubtract (numA : readonly number[], numB : readonly number[]) : number[] {
    const result : number[] = [];

    let carry = 0;
    for (let i=0; i<numA.length; ++i) {
        carry += numA[numA.length-i-1];
        carry -= (
            i < numB.length ?
            numB[numB.length-i-1] :
            0
        );

        if (carry >= 0) {
            result.unshift(carry);
            carry = 0;
        } else {
            carry += 10;
            result.unshift(carry);
            carry = -1;
        }
    }

    if (carry < 0) {
        throw new Error(`Result of unsigned subtraction is negative`);
    }

    while (result[0] == 0 && result.length >= 2) {
        result.shift();
    }

    return result;
}

export function unsignedDecimalStrAdd (a : string, b : string) : string {
    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);

    return unsignedDigitArrayAdd(numA, numB).join("");
}

export function unsignedDecimalStrSubtract (a : string, b : string) : string {
    if (a == b) {
        return "0";
    }
    if (a.length < b.length) {
        throw new Error(`Result of unsigned subtraction is negative`);
    }
    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);

    return unsignedDigitArraySubtract(numA, numB).join("");
}

export function unsignedDecimalStrMultiply (a : string, b : string) : string {
    if (a == "0" || b == "0") {
        return "0";
    }

    if (a == "1") {
        return b;
    }

    if (b == "1") {
        return a;
    }

    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);

    const arr = numB.map((digitB, indexB) => {
        const result : number[] = [];
        let carry = 0;
        for (let i=numA.length-1; i>=0; --i) {
            const digitA = numA[i];
            carry += digitA * digitB;

            const digit = carry%10;
            carry = Math.floor(carry/10);

            result.unshift(digit);
        }

        if (carry != 0) {
            result.unshift(carry);
        }

        const powerOf10 = numB.length - indexB - 1;
        for (let i=0; i<powerOf10; ++i) {
            result.push(0);
        }

        return result;
    });

    if (arr.length == 0) {
        return "0";
    }
    if (arr.length == 1) {
        return arr[0].join("");
    }

    const [x, y, ...rest] = arr;
    let result = unsignedDigitArrayAdd(x, y);
    for (const r of rest) {
        result = unsignedDigitArrayAdd(result, r);
    }
    return result.join("");
}

export function unsignedDigitArrayGreaterThanOrEqual (numA : number[], numB : number[]) : boolean {
    if (numA.length > numB.length) {
        return true;
    }
    if (numA.length < numB.length) {
        return false;
    }

    for (let i=0; i<numA.length; ++i) {
        const digitA = numA[i];
        const digitB = numB[i];

        if (digitA > digitB) {
            return true;
        }
        if (digitA < digitB) {
            return false;
        }
    }

    return true;
}

export function unsignedDigitArrayLessThanOrEqual (numA : number[], numB : number[]) : boolean {
    return unsignedDigitArrayGreaterThanOrEqual(numB, numA);
}

export function unsignedDecimalStrDivide (a : string, b : string) : string {
    if (b == "0") {
        throw new Error(`DivideByZeroError: Cannot divide by zero`);
    }

    if (b == "1") {
        return a;
    }

    if (a == "0") {
        return "0";
    }


    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);

    const quotient : number[] = [];
    let remainder : number[] = [];

    for (let i=0; i<numA.length; ++i) {
        remainder.push(numA[i]);
        while (remainder[0] == 0 && remainder.length >= 2) {
            remainder.shift();
        }
        if (remainder.length < numB.length) {
            quotient.push(0);
            continue;
        }
        let tmp = [0];
        let q = 0;
        while (q <= 9) {
            const tmp2 = unsignedDigitArrayAdd(tmp, numB);
            if (unsignedDigitArrayLessThanOrEqual(tmp2, remainder)) {
                tmp = tmp2;
                ++q;
            } else {
                break;
            }
        }

        if (q == 0) {
            quotient.push(0);
            continue;
        }

        quotient.push(q);
        remainder = unsignedDigitArraySubtract(
            remainder,
            tmp
        );
    }

    while (quotient[0] == 0 && quotient.length >= 2) {
        quotient.shift();
    }

    return quotient.join("");
}
