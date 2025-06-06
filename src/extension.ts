import * as vs from "vscode";
import { MatlabAutoDocstring } from "./generate_docstring";
import { docstringIsClosed, validDocstringPrefix } from "./parse";
import { extensionRoot, generateDocstringCommand, extensionID } from "./constants";
import { getStackTrace } from "./telemetry";
import { logInfo, logError } from "./logger";

export function activate(context: vs.ExtensionContext): void {
    extensionRoot.path = context.extensionPath;

    logInfo("Activating matlabAutoDocstring...");

    context.subscriptions.push(
        vs.commands.registerCommand(generateDocstringCommand, () => {
            const editor = vs.window.activeTextEditor;
            const matlabAutoDocstring = new MatlabAutoDocstring(editor);

            try {
                return matlabAutoDocstring.generateDocstring();
            } catch (error) {
                const errorString = JSON.stringify(error);
                let stackTrace = "";
                if (error instanceof Error) {
                    stackTrace = "\n\t" + getStackTrace(error);
                }
                return logError(errorString + stackTrace);
            }
        }),
    );

    ["matlab"].map((language) => {
        context.subscriptions.push(
            vs.languages.registerCompletionItemProvider(
                language,
                {
                    provideCompletionItems: (document: vs.TextDocument, position: vs.Position) => {
                        if (validEnterActivation(document, position)) {
                            return [new AutoDocstringCompletionItem(document, position)];
                        }
                    },
                },
                '"',
                "'",
                "#",
            ),
        );
    });

    logInfo("matlabAutoDocstring was activated");
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {
    return;
}

/**
 * Checks that the preceding characters of the position is a valid docstring prefix
 * and that the prefix is not part of an already closed docstring
 */
function validEnterActivation(document: vs.TextDocument, position: vs.Position): boolean {
    const docString = document.getText();
    const quoteStyle = getQuoteStyle();

    return (
        validDocstringPrefix(docString, position.line, position.character, quoteStyle) &&
        !docstringIsClosed(docString, position.line, position.character, quoteStyle)
    );
}

/**
 * Completion item to trigger generate docstring command on docstring prefix
 */
class AutoDocstringCompletionItem extends vs.CompletionItem {
    constructor(_: vs.TextDocument, position: vs.Position) {
        super("Generate Docstring", vs.CompletionItemKind.Snippet);
        this.insertText = "";
        this.filterText = getQuoteStyle();
        this.sortText = "\0";

        this.range = new vs.Range(new vs.Position(position.line, 0), position);

        this.command = {
            command: generateDocstringCommand,
            title: "Generate Docstring",
        };
    }
}

function getQuoteStyle(): string {
    return vs.workspace.getConfiguration(extensionID).get("quoteStyle").toString();
}
