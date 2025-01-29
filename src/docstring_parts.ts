import dedent from "ts-dedent";

export interface DocstringParts {
    name: string;
    args: Argument[];
    hasExceptions: boolean;
    returns: Returns[];
}

export interface Argument {
    var: string;
    type: string;
    size: string;
    conditions: string;
}

export interface Exception {
    type: string;
}

export interface Returns {
    var: string;
    type: string;
    size: string;
    conditions: string;
}

export function docstringPartsToString(docstringParts: DocstringParts): string {
    const argsText = docstringParts.args.length
        ? docstringParts.args.map((argument) => `${argument.var} ${argument.type}`).join("\n")
        : "N/A";
    const exceptionsText = docstringParts.hasExceptions
        ? "Yes"
        : "No";
    const returnsText = docstringParts.returns.length
        ? docstringParts.returns.map((argument) => `${argument.var} ${argument.type}`).join("\n")
        : "N/A";

    return dedent`
    Docstring parts:
        Name:
            ${docstringParts.name}
        Args:
            ${argsText}
        Exceptions:
            ${exceptionsText}
        Returns:
            ${returnsText}
    `;
}
