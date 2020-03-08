export function unsignedDecimalStrAdd (a : string, b : string) : string {
    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);

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

    return result.join("");
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

    let carry = 0;
    for (let i=0; i<numA.length; ++i) {
        carry += numA[numA.length-i-1];
        carry -= (
            i < numB.length ?
            numB[numB.length-i-1] :
            0
        );

        if (carry >= 0) {
            numA[numA.length-i-1] = carry;
            carry = 0;
        } else {
            carry += 10;
            numA[numA.length-i-1] = carry;
            carry = -1;
        }
    }

    if (carry < 0) {
        throw new Error(`Result of unsigned subtraction is negative`);
    }

    return numA.join("");
}
