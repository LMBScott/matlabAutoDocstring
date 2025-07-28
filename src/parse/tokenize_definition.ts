import { TokenSet } from "./token_set";

export function tokenizeDefinition(functionDefinition: string): TokenSet {
    const definitionPattern =
        /^\s*function\s+(?:(?:\[\s*((?:\w+(?:\s*,\s*)*)+)\s*\]|([\w]+)){1}\s*=\s*)?(\w+)\s*\(([\s\S]*)\)\s*(?:%.*)?$/;

    const match = definitionPattern.exec(functionDefinition);

    const tokens = new TokenSet();

    // No parameters
    if (match == undefined || match[4] == undefined) {
        tokens.parameters = [];
    }

    // Include matched parameter tokens (capture group 4)
    tokens.parameters = tokenizeVariableString(match[4]);

    // Include matched return value tokens), if any
    if (match[1] != undefined) {
        // Multiple return values (in square brackets) are output to capture group 1
        tokens.returns = tokenizeVariableString(match[1]);
    } else if (match[2] != undefined)
    {
        // Single return values are output to capture group 2
        tokens.returns = tokenizeVariableString(match[2]);
    }

    return tokens;
}

function tokenizeVariableString(parameterString: string): string[] {
    const stack: string[] = [];
    const parameters: string[] = [];
    let arg = "";

    let position = parameterString.length - 1;

    while (position >= 0) {
        const top = stack[stack.length - 1];
        let char = parameterString.charAt(position);

        /* todo
            '<' char,
            error management
        */
        switch (true) {
            // 1. Check for top level comma and push arg to array
            case char === "," && stack.length === 0:
                parameters.unshift(arg);
                arg = "";
                position -= 1;
                continue;

            // 2. Disregard whitespace at top level of stack
            case char === " " && stack.length === 0:
            case char === "\n" && stack.length === 0:
            case char === "\t" && stack.length === 0:
                position -= 1;
                continue;
        }

        arg = char + arg;
        position -= 1;
    }

    if (arg.length > 0) {
        parameters.unshift(arg);
    }

    return parameters;
}
