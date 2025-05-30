/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    Argument,
    DocstringParts,
    Exception,
    Returns,
} from "../docstring_parts";

export class TemplateData {
    public name: string;
    public args: Argument[];
    public hasExceptions: boolean;
    public returns: Returns[];

    private includeName: boolean;
    private includeExtendedSummary: boolean;

    constructor(
        docstringParts: DocstringParts,
        guessTypes: boolean,
        includeName: boolean,
        includeExtendedSummary: boolean,
    ) {
        this.name = docstringParts.name;
        this.args = docstringParts.args;
        this.hasExceptions = docstringParts.hasExceptions;
        this.returns = docstringParts.returns;

        this.includeName = includeName;
        this.includeExtendedSummary = includeExtendedSummary;

        if (!guessTypes) {
            this.removeTypes();
        }

        this.addDefaultTypePlaceholders("_type_");
    }

    public placeholder() {
        return (text: string, render: (_: string) => string): string => {
            return "${@@@:" + render(text) + "}";
        };
    }

    public summaryPlaceholder(): string {
        if (this.includeName) {
            return this.name + " ${@@@:_summary_}";
        }

        return "${@@@:_summary_}";
    }

    public extendedSummaryPlaceholder(): string {
        if (this.includeExtendedSummary) {
            return "${@@@:_extended_summary_}";
        }

        return "";
    }

    public typePlaceholder(): string {
        // Need to ignore rules because this.type only works in
        // the context of mustache applying a template
        // @ts-ignore
        return "${@@@:" + this.type + "}";
    }

    public descriptionPlaceholder(): string {
        return "${@@@:_description_}";
    }

    public argsExist(): boolean {
        return this.args.length > 0;
    }

    public parametersExist(): boolean {
        return this.args.length > 0;
    }

    public exceptionsExist(): boolean {
        return this.hasExceptions;
    }

    public returnsExist(): boolean {
        return this.returns.length > 0;
    }

    private removeTypes(): void {
        for (const arg of this.args) {
            arg.type = undefined;
        }

        if (this.returnsExist()) {
            for (const returnVal of this.returns) {
                returnVal.type = undefined;
            }
        }
    }

    private addDefaultTypePlaceholders(placeholder: string): void {
        for (const arg of this.args) {
            if (arg.type === undefined) {
                arg.type = placeholder;
            }
        }

        if (this.returnsExist()) {
            for (const returnVal of this.returns) {
                if (returnVal.type === undefined)
                {
                    returnVal.type = placeholder;
                }
            }
        }
    }
}
