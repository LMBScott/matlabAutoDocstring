import { guessType, TokenSet } from ".";
import {
    Argument,
    DocstringParts,
    Exception,
    Returns,
} from "../docstring_parts";

export function parseParameters(
    parameterTokens: TokenSet,
    body: string[],
    functionName: string,
): DocstringParts {
    return {
        name: functionName,
        args: parseArguments(body, parameterTokens.parameters),
        returns: parseReturns(body, parameterTokens.returns),
        hasExceptions: parseExceptions(body),
    };
}

function parseArguments(body: string[], parameters: string[]): Argument[] {
    var args = parseArgumentsOrReturns<Argument>(body, parameters, false);

    return args;
}

function parseArgumentsOrReturns<T extends Argument | Returns>(body: string[], parameters: string[], parseReturns: boolean): T[] {
    const args: Record<string, T> = {};
    const signature_pattern = /^(\w+)/;

    for (const param of parameters) {
        const match = param.trim().match(signature_pattern);

        if (match == null) {
            continue;
        }

        args[match[1]] = {
            var: match[1],
            size: undefined,
            type: undefined,
            conditions: undefined
        } as T;
    }
    
    var validationParameterPattern = /(?:\([ \t]*Input[ \t]*\)\s*)?/;
    
    // If parsing returns, search for the Output parameter to the argument block
    if (parseReturns)
    {
        validationParameterPattern = /(?:\([ \t]*Output[ \t]*\)\s*){1}/;
    }

    const validation_pattern = RegExp(/^(?<!%.*)arguments\s*/.source + validationParameterPattern.source + /\n((?:[ \t]*\w+[ \t]*(?:\((?:[ \t]*[\d+:][ \t]*,?)+\))?[ \t]*(?:\w+[ \t]*)?(?:\{(?:[ \t]*\w*[ \t]*,?)*\})?\n)*)[ \t]*end/.source, "m");
    const body_joined = body.join('\n');

    // Search for an input validation block in the function body
    const validation_match = body_joined.match(validation_pattern);

    // No input validation block found, return argument data without type and size specifications
    if (validation_match === null) {
        console.log("Validation lines not found")
        return Object.values(args);
    }

    // Argument validation lines are found in the 1st capture group
    const validation_lines = validation_match[1];

    const argument_pattern = /[ \t]*(\w+)[ \t]*(\((?:[ \t]*(?:\d+|:)[ \t]*,?)+\))?[ \t]*(\w+)?[ \t]*(\{(?:[ \t]*\w*[ \t]*,?)*\})?/;
    console.log("Validation lines found")

    // Iterate over each argument's validation line and parse the size and type specified for it
    for (const line of validation_lines.split('\n')) {
        const match = line.match(argument_pattern);

        if (match === null) {
            continue;
        }

        // Check whether the argument was already found in the function signature
        if (match[1] in args) {
            // Add size if specified
            if (match[2] !== undefined) {
                const size = formatValidationSize(match[2]);
                args[match[1]].size = size;
            }

            // Add type if specified
            if (match[3] !== undefined) {
                args[match[1]].type = match[3];
            }

            // Add conditions if any are specified
            if (match[4] !== undefined) {
                args[match[1]].conditions = formatValidationConditions(match[4]);
            }
        }
    }

    return Object.values(args);
}

function formatValidationSize(validationSize: string): string {
    // Remove leading and trailing parentheses, then split size values into individual strings
    const sizeStr = validationSize.replace(/[\(\) \t]/g, '').replace(',', ' x ');

    return sizeStr;
}

function formatValidationConditions(validationConditions: string): string {
    // Remove leading and trailing curly braces, then comma-separate conditions with a single space between each
    const sizeStr = validationConditions.replace(/[\{\} \t]/g, '').replace(',', ', ');

    return sizeStr;
}

function parseReturns(body: string[], parameters: string[]): Returns[] {
    const returns = parseArgumentsOrReturns<Returns>(body, parameters, true);

    return returns;
}

function parseExceptions(body: string[]): boolean {
    var hasExceptions = false;
    
    const pattern = /(?<!%.*)error\(.*\)/;

    for (const line of body) {
        const match = line.match(pattern);

        if (match != null) {
            hasExceptions = true;
        }
    }

    return hasExceptions;
}

export function inArray<type>(item: type, array: type[]) {
    return array.some((x) => item === x);
}
