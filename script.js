let editor;
let currentProject = "MyVerseProject";
let aiEnabled = true;

require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs" }});

require(["vs/editor/editor.main"], function () {

    monaco.languages.register({ id: "verse" });

    monaco.languages.setMonarchTokensProvider("verse", {
        tokenizer: {
            root: [
                [/\b(module|using|class|fn|if|else|for|return|var|set|override|suspends)\b/, "keyword"],
                [/[a-zA-Z_]\w*/, "identifier"],
                [/[{}()\[\]]/, "@brackets"],
                [/"[^"]*"/, "string"],
                [/[0-9]+/, "number"],
            ]
        }
    });

    editor = monaco.editor.create(document.getElementById("editor"), {
        value: defaultVerseTemplate(),
        language: "verse",
        theme: "vs-dark",
        automaticLayout: true,
        inlineSuggest: { enabled: true }
    });

    document.getElementById("aiToggle").addEventListener("change", (e) => {
        aiEnabled = e.target.checked;
    });

    registerAI();
});

function defaultVerseTemplate() {
return `module ${currentProject}

using { /Fortnite.com/Devices }

class MainDevice := creative_device:

    OnBegin<override>()<suspends> : void =
        `
}

function registerAI() {
    monaco.languages.registerInlineCompletionsProvider("verse", {
        provideInlineCompletions: async (model, position) => {

            if (!aiEnabled) return { items: [] };

            const textBefore = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });

            const suggestion = generateAISuggestion(textBefore);

            if (!suggestion) return { items: [] };

            return {
                items: [{
                    insertText: suggestion,
                    range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column
                    }
                }]
            };
        },
        freeInlineCompletions: () => {}
    });
}

function generateAISuggestion(context) {

    // Basic smart patterns (replace with real AI later)

    if (context.trim().endsWith("OnBegin<override>()<suspends> : void =")) {
        return `\n        Print("Game Started!")`;
    }

    if (context.trim().endsWith("if")) {
        return ` (Condition):\n        `;
    }

    if (context.includes("creative_device") && !context.includes("OnBegin")) {
        return `\n\n    OnBegin<override>()<suspends> : void =\n        Print("Initialized")`;
    }

    if (context.trim().endsWith("Print(")) {
        return `"Hello World!")`;
    }

    return "";
}
function validateVerse() {
    const code = editor.getValue();
    const markers = [];
    const lines = code.split("\n");

    const validTypes = [
        "agent",
        "player",
        "int",
        "float",
        "string",
        "logic",
        "void",
        "creative_device"
    ];

    let hasModule = false;
    let hasClass = false;

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmed = line.trim();

        // MODULE VALIDATION
        if (trimmed.startsWith("module")) {
            hasModule = true;
            const parts = trimmed.split(" ");
            if (parts.length !== 2) {
                markers.push(makeError(
                    "Invalid module declaration. Format: module ProjectName",
                    lineNumber
                ));
            }
        }

        // CLASS VALIDATION
        if (trimmed.includes("class")) {
            hasClass = true;

            if (!trimmed.includes(":=")) {
                markers.push(makeError(
                    "Class must use ':=' syntax.",
                    lineNumber
                ));
            }

            if (!trimmed.includes(":")) {
                markers.push(makeError(
                    "Class must inherit from a type (e.g. creative_device).",
                    lineNumber
                ));
            }
        }

        // FUNCTION SIGNATURE VALIDATION
        const functionPattern =
            /^(\w+)\s*\((.*?)\)\s*(<override>)?\s*(<suspends>)?\s*:\s*(\w+)\s*=$/;

        if (trimmed.includes("(") && trimmed.includes(")") && trimmed.includes(":")) {

            const match = trimmed.match(functionPattern);

            if (!match) {
                markers.push(makeError(
                    "Invalid function signature. Expected: name(params)<override><suspends> : returnType =",
                    lineNumber
                ));
            } else {
                const paramSection = match[2];
                const returnType = match[5];

                // Validate return type
                if (!validTypes.includes(returnType)) {
                    markers.push(makeError(
                        `Invalid return type "${returnType}".`,
                        lineNumber
                    ));
                }

                // Validate parameters
                if (paramSection.trim() !== "") {
                    const params = paramSection.split(",");

                    params.forEach(param => {
                        const pieces = param.split(":");
                        if (pieces.length !== 2) {
                            markers.push(makeError(
                                "Invalid parameter format. Use name : type",
                                lineNumber
                            ));
                        } else {
                            const type = pieces[1].trim();
                            if (!validTypes.includes(type)) {
                                markers.push(makeError(
                                    `Unknown type "${type}".`,
                                    lineNumber
                                ));
                            }
                        }
                    });
                }
            }
        }

        // Invalid dash operator
        if (trimmed.endsWith("-")) {
            markers.push(makeError(
                'Invalid "-" operator. Did you mean "="?',
                lineNumber
            ));
        }
    });

    if (!hasModule) {
        markers.push(makeError("Missing module declaration.", 1));
    }

    if (!hasClass) {
        markers.push(makeError("No class defined.", 1));
    }

    monaco.editor.setModelMarkers(editor.getModel(), "verse", markers);
}

function makeError(message, lineNumber) {
    return {
        message,
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: 100
    };
}
