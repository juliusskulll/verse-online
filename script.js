let editor;
let currentProject = "MyVerseProject";

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
        automaticLayout: true
    });

    editor.onDidChangeModelContent(() => {
        validateVerse();
    });

    validateVerse();
});

function defaultVerseTemplate() {
return `module ${currentProject}

using { /Fortnite.com/Devices }

class MainDevice := creative_device:

    OnBegin<override>()<suspends> : void =
        Print("Hello from Verse Web IDE!")`
}

function createProject() {
    currentProject = document.getElementById("projectName").value || "MyVerseProject";
    editor.setValue(defaultVerseTemplate());
}

function validateVerse() {
    const code = editor.getValue();
    const markers = [];

    const lines = code.split("\n");

    // Rule 1: Must have module
    if (!code.includes("module")) {
        markers.push({
            message: "Missing module declaration.",
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
        });
    }

    // Rule 2: Must have class
    if (!code.includes("class")) {
        markers.push({
            message: "No class defined in project.",
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
        });
    }

    // Rule 3: Must have OnBegin override
    if (!code.includes("OnBegin<override>")) {
        markers.push({
            message: "Missing required OnBegin<override>() function.",
            severity: monaco.MarkerSeverity.Warning,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
        });
    }

    // Rule 4: Bracket matching
    const openBrackets = (code.match(/{/g) || []).length;
    const closeBrackets = (code.match(/}/g) || []).length;

    if (openBrackets !== closeBrackets) {
        markers.push({
            message: "Unmatched curly brackets.",
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lines.length,
            startColumn: 1,
            endLineNumber: lines.length,
            endColumn: 1
        });
    }

    // Rule 5: Missing using
    if (!code.includes("using")) {
        markers.push({
            message: "No using statement found.",
            severity: monaco.MarkerSeverity.Warning,
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
        });
    }

    monaco.editor.setModelMarkers(editor.getModel(), "verse", markers);
}

function downloadProject() {
    const blob = new Blob([editor.getValue()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = currentProject + ".verse";
    link.click();
}
