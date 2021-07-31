function checkBrackets(str) {
    let opened = 0;

    for (let i of str) {
        if (i === '(') {
            opened++;
        }

        if (i === ')') {
            opened--;
        }

        if (opened < 0) {
            return false;
        }
    }

    return opened === 0;
}


function findSameLevelParenthesisIndex(str, startIndex) {
    let deepLevel = 0;

    for (let i = startIndex; i < str.length; i++) {
        if (str[i] === '(') {
            deepLevel++;
        }

        if (str[i] === ')') {
            deepLevel--;
        }

        if (deepLevel < 0) {
            return i;
        }
    }
}

function parseExpression(str) {
    const parsed = [];
    let numCapacitor = '';

    const signs = ['+', '-', '*', '/'];

    // To make the cycle runs one more time at the end
    str += ' ';

    for (let i = 0, sym = str[0]; i < str.length; sym = str[++i]) {
        if (/[0-9.]/.test(sym)) {
            numCapacitor += sym;
            continue;
        }

        // If sym is not a digit, but capacitor contains a number - flush capacitor to parsed array
        if (numCapacitor.length > 0) {
            parsed.push(parseFloat(numCapacitor));
            numCapacitor = '';
        }

        if (signs.includes(sym)) {
            // If its a part of following number
            if (sym === '-' && (typeof(parsed[parsed.length - 1]) !== 'number' && !Array.isArray(parsed[parsed.length - 1])) && /[0-9(]/.test(str[i + 1])) {
                // A special symbol, to make next number negative later
                parsed.push('~');
                continue;
            }

            parsed.push(sym);
            continue;
        }

        if (sym === '(') {
            const closeParenthesisIndex = findSameLevelParenthesisIndex(str, i + 1);
            parsed.push(parseExpression(str.slice(i + 1, closeParenthesisIndex)));
            i = closeParenthesisIndex;
        }
    }

    return parsed;
}

function evaluate(array) {
    // Evaluate all parentheses (inner expressions) recursively
    for (const [i, one] of array.entries()) {
        if (Array.isArray(one)) {
            array[i] = evaluate(one);
        }
    }

    // Make numbers negative with '~'
    for (let i = 0, one = array[0]; i < array.length; one = array[++i]) {
        if (one === '~') {
            array.splice(i, 2, -array[i + 1]);
        }
    }

    // Evaluate multiplies (*) and divides (/)
    for (let i = 0, one = array[0]; i < array.length; one = array[++i]) {
        if (one === '*') {
            array.splice(i - 1, 3, array[i - 1] * array[i + 1]);
            i--;
        }
        if (one === '/') {
            if (array[i + 1] === 0) {
                throw Error('TypeError: Division by zero.');
            }
            array.splice(i - 1, 3, array[i - 1] / array[i + 1]);
            i--;
        }
    }

    // Then add (+) and sub (-)
    for (let i = 0, one = array[0]; i < array.length; one = array[++i]) {
        if (one === '+') {
            array.splice(i - 1, 3, array[i - 1] + array[i + 1]);
            i--;
        }
        if (one === '-') {
            array.splice(i - 1, 3, array[i - 1] - array[i + 1]);
            i--;
        }
    }

    return array.reduce((sum, one) => sum + one);
}

function expressionCalculator(expr) {
    if (!checkBrackets(expr)) {
        throw Error('ExpressionError: Brackets must be paired');
    }
    return evaluate(parseExpression(expr));
}

module.exports = {
    expressionCalculator
}
