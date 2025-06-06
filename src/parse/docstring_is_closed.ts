import { blankLine, indentationOf } from "./utilities";

export function docstringIsClosed(
    document: string,
    linePosition: number,
    charPosition: number,
    quoteStyle: string,
): boolean {
    const lines = document.split("\n");

    if (quotesCloseExistingDocstring(lines, linePosition, charPosition, quoteStyle)) {
        return true;
    }

    if (quotesOpenExistingDocstring(lines, linePosition, charPosition, quoteStyle)) {
        return true;
    }

    return false;
}

function quotesCloseExistingDocstring(
    lines: string[],
    linePosition: number,
    charPosition: number,
    quoteStyle: string,
): boolean {
    const linesBeforePosition = sliceUpToPosition(lines, linePosition, charPosition);
    let numberOfTripleQuotes = 0;

    for (const line of linesBeforePosition.reverse()) {
        if (line.includes("function ")) {
            break;
        }

        numberOfTripleQuotes += occurrences(line, quoteStyle);
    }

    return numberOfTripleQuotes % 2 === 0;
}

function quotesOpenExistingDocstring(
    lines: string[],
    linePosition: number,
    charPosition: number,
    quoteStyle: string,
): boolean {
    const linesAfterPosition = sliceFromPosition(lines, linePosition, charPosition);
    const originalIndentation = indentationOf(lines[linePosition]);

    // Need to check first line separately because indentation was sliced off
    if (linesAfterPosition[0].includes(quoteStyle)) {
        return true;
    }

    for (const line of linesAfterPosition.slice(1)) {
        if (line.includes(quoteStyle)) {
            return true;
        }

        if (
            (!blankLine(line) && indentationOf(line) < originalIndentation) ||
            line.includes("function ")
        ) {
            return false;
        }
    }

    return false;
}

function sliceUpToPosition(lines: string[], linePosition: number, charPosition: number): string[] {
    const slicedDocument = lines.slice(0, linePosition);
    slicedDocument.push(lines[linePosition].slice(0, charPosition));

    return slicedDocument;
}

function sliceFromPosition(lines: string[], linePosition: number, charPosition: number): string[] {
    let slicedDocument = [lines[linePosition].slice(charPosition)];
    slicedDocument = slicedDocument.concat(lines.slice(linePosition + 1));

    return slicedDocument;
}

function occurrences(str: string, word: string): number {
    return str.split(word).length - 1;
}
