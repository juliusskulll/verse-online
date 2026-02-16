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
