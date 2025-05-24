import * as path from "path";
import * as vs from "vscode";
import { DocstringFactory } from "./docstring/docstring_factory";
import { getCustomTemplate, getTemplate } from "./docstring/get_template";
import { getDocstringIndentation, getFunctionCount, getDefaultIndentation, parse } from "./parse";
import { extensionID } from "./constants";
import { logDebug, logInfo } from "./logger";
import { docstringPartsToString } from "./docstring_parts";

export class MatlabAutoDocstring {
    private editor: vs.TextEditor;

    constructor(editor: vs.TextEditor) {
        this.editor = editor;
    }

    public generateDocstring(): Thenable<boolean> {
        if (this.editor == undefined) {
            throw new Error(
                "Cannot process this document. It is either too large or is not yet supported.",
            );
        }

        const document = this.editor.document.getText();

        const position = this.editor.selection.active;
        logInfo(`Generating Docstring at line: ${position.line}`);
        
        const config = this.getConfig();

        // Insert docstring at document start if appropriate
        var insertPosition = position.with(undefined, 0);
        var shouldIndentDocstring = true;
        if (config.get("insertAtDocumentStart") && getFunctionCount(document) === 1)
        {
            insertPosition = this.editor.document.positionAt(0);

            // Don't indent docstrings at the start of a document
            shouldIndentDocstring = false;
        }
        
        const docstringSnippet = this.generateDocstringSnippet(document, position, shouldIndentDocstring);
        logInfo(`Docstring generated:\n${docstringSnippet.value}`);

        logInfo(`Inserting at position: ${insertPosition.line} ${insertPosition.character}`);
        
        const success = this.editor.insertSnippet(docstringSnippet, insertPosition);

        success.then(
            () => logInfo("Successfully inserted docstring"),
            (reason) => {
                throw new Error("Could not insert docstring: " + JSON.stringify(reason));
            },
        );

        return success;
    }

    private generateDocstringSnippet(document: string, position: vs.Position, indent: boolean): vs.SnippetString {
        const config = this.getConfig();

        const docstringFactory = new DocstringFactory(
            this.getTemplate(),
            config.get("quoteStyle").toString(),
            config.get("startOnNewLine") === true,
            config.get("includeExtendedSummary") === true,
            config.get("includeName") === true,
            config.get("guessTypes") === true,
        );
        logDebug(docstringFactory.toString());

        const docstringParts = parse(document, position.line);
        logDebug(docstringPartsToString(docstringParts));
        const defaultIndentation = getDefaultIndentation(
            this.editor.options.insertSpaces as boolean,
            this.editor.options.tabSize as number,
        );
        logDebug(`Default indentation: "${defaultIndentation}"`);
        var indentation = "";
        
        if (indent)
        {
            indentation = getDocstringIndentation(document, position.line, defaultIndentation);
        }

        logDebug(`Indentation: "${indentation}"`);
        const docstring = docstringFactory.generateDocstring(docstringParts, indentation);

        return new vs.SnippetString(docstring);
    }

    private getTemplate(): string {
        const config = this.getConfig();
        let customTemplatePath = config.get("customTemplatePath").toString();

        if (customTemplatePath === "") {
            const docstringFormat = config.get("docstringFormat").toString();
            return getTemplate(docstringFormat);
        }

        if (!path.isAbsolute(customTemplatePath)) {
            customTemplatePath = path.join(vs.workspace.rootPath, customTemplatePath);
        }

        return getCustomTemplate(customTemplatePath);
    }

    private getConfig(): vs.WorkspaceConfiguration {
        return vs.workspace.getConfiguration(extensionID);
    }
}
