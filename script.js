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

    lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Match function definitions
        const functionRegex = /^(\w+)\s*\((.*?)\)\s*:\s*(\w+)\s*(.)?$/;
        const match = line.trim().match(functionRegex);

        if (match) {
            const functionName = match[1];
            const params = match[2];
            const returnType = match[3];
            const endingChar = match[4];

            // Check return type
            if (!validTypes.includes(returnType)) {
                markers.push({
                    message: `Invalid return type "${returnType}".`,
                    severity: monaco.MarkerSeverity.Error,
                    startLineNumber: lineNumber,
                    startColumn: line.indexOf(returnType) + 1,
                    endLineNumber: lineNumber,
                    endColumn: line.indexOf(returnType) + returnType.length + 1
                });
            }

            // Check parameters
            if (params.trim() !== "") {
                const paramParts = params.split(":");

                if (paramParts.length !== 2) {
                    markers.push({
                        message: "Invalid parameter format. Use (name : type).",
                        severity: monaco.MarkerSeverity.Error,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1
                    });
                } else {
                    const paramType = paramParts[1].trim();
                    if (!validTypes.includes(paramType)) {
                        markers.push({
                            message: `Unknown type "${paramType}".`,
                            severity: monaco.MarkerSeverity.Error,
                            startLineNumber: lineNumber,
                            startColumn: line.indexOf(paramType) + 1,
                            endLineNumber: lineNumber,
                            endColumn: line.indexOf(paramType) + paramType.length + 1
                        });
                    }
                }
            }

            // Must end with =
            if (endingChar !== "=") {
                markers.push({
                    message: `Function must end with "=" not "${endingChar || "nothing"}".`,
                    severity: monaco.MarkerSeverity.Error,
                    startLineNumber: lineNumber,
                    startColumn: line.length,
                    endLineNumber: lineNumber,
                    endColumn: line.length + 1
                });
            }
        }

        // Detect dash used incorrectly
        if (line.trim().endsWith("-")) {
            markers.push({
                message: `Invalid function terminator "-". Did you mean "="?`,
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: lineNumber,
                startColumn: line.length,
                endLineNumber: lineNumber,
                endColumn: line.length + 1
            });
        }
    });

    monaco.editor.setModelMarkers(editor.getModel(), "verse", markers);
}

