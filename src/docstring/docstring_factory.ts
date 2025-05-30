import { render } from "mustache";
import { DocstringParts } from "../docstring_parts";
import { TemplateData } from "./template_data";
import { dedent } from "ts-dedent";
import Mustache = require("mustache");

// Disable HTML-escaping behavior globally
Mustache.escape = (text: string) => text;

export class DocstringFactory {
    private template: string;
    private quoteStyle: string;

    private startOnNewLine: boolean;
    private includeDescription: boolean;
    private includeName: boolean;
    private guessTypes: boolean;

    constructor(
        template: string,
        quoteStyle = '% ',
        startOnNewLine = false,
        includeDescription = true,
        includeName = false,
        guessTypes = true,
    ) {
        this.quoteStyle = quoteStyle;

        this.startOnNewLine = startOnNewLine;
        this.guessTypes = guessTypes;
        this.includeName = includeName;
        this.includeDescription = includeDescription;

        this.template = template;
    }

    public generateDocstring(docstringParts: DocstringParts, indentation = ""): string {
        const templateData = new TemplateData(
            docstringParts,
            this.guessTypes,
            this.includeName,
            this.includeDescription,
        );

        let docstring = render(this.template, templateData);

        docstring = this.addSnippetPlaceholders(docstring);
        docstring = this.condenseNewLines(docstring);
        docstring = this.condenseTrailingNewLines(docstring);
        docstring = this.commentText(docstring);
        docstring = this.indentDocstring(docstring, indentation);

        return docstring;
    }

    public toString(): string {
        return dedent`
        DocstringFactory Configuration
        quoteStyle:
            ${this.quoteStyle}
        startOnNewLine:
            ${this.startOnNewLine}
        guessTypes:
            ${this.guessTypes}
        includeName:
            ${this.includeName}
        includeDescription:
            ${this.includeDescription}
        template:
        ${this.template}
        `;
    }

    private addSnippetPlaceholders(snippetString: string): string {
        let placeholderNumber = 0;
        snippetString = snippetString.replace(/@@@/g, () => {
            return (++placeholderNumber).toString();
        });

        return snippetString;
    }

    private condenseNewLines(snippet: string): string {
        return snippet.replace(/\n{3,}/gm, "\n\n");
    }

    private condenseTrailingNewLines(snippet: string): string {
        return snippet.replace(/\n+$/g, "\n");
    }

    private commentText(snippet: string): string {
        if (this.startOnNewLine) {
            snippet = "\n" + snippet;
        }

        var output: string = "";

        // Add a quote at the start of each line
        for (const line of snippet.split('\n')) {
            output += this.quoteStyle + line + '\n';
        }

        return output;
    }

    private indentDocstring(snippet: string, indentation: string): string {
        const snippetLines = snippet.split("\n");

        snippetLines.forEach((line, index) => {
            if (line !== "") {
                snippetLines[index] = indentation + line;
            }
        });

        return snippetLines.join("\n");
    }
}
