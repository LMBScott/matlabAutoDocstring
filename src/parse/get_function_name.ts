export function getFunctionName(functionDefinition: string): string {
    const pattern = /\bfunction\s*(?:\[\s*\w+(?:\s*,\s*\w+)*\s*\]|\w+)\s*=\s*(\w+)\s*\(/;

    const match = pattern.exec(functionDefinition);

    if (match == undefined || match[1] == undefined) {
        return "";
    }

    return match[1];
}
