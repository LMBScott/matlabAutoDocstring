// Will be set in extension activation.
type ExtensionRoot = { path?: string };
export const extensionRoot: ExtensionRoot = { path: "" };

export const debug = false;
export const extensionID = "matlabAutoDocstring";
export const generateDocstringCommand = "matlabAutoDocstring.generateDocstring";
