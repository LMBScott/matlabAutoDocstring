import { blankLine, preprocessLines } from "./utilities";

/**
 * Get the number of functions defined in a document.
 *
 * @param document The document contents.
 */
export function getFunctionCount(document: string): number {
    const lines = preprocessLines(document.split("\n"));
    const line_count = lines.length;

    const pattern = /\b(function)\b/g;

    // Number of functions in the document
    var function_count = 0;

    for (var i = 0; i < line_count; i++) {
        // Skip blank lines
        if (lines[i] == undefined || blankLine(lines[i])) {
            continue;
        }

        if (pattern.test(lines[i]))
        {
            function_count++;
        }
    }

    return function_count;
}
