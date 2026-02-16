let editor;
let currentProject = "MyVerseProject";

require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs" }});

require(["vs/editor/editor.main"], function () {

    monaco.languages.register({ id: "verse" });

    monaco.languages.setMonarchTokensProvider("verse", {
        tokenizer: {
            root: [
                [/\b(module|using|class|fn|if|else|for|return|var|set)\b/, "keyword"],
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

function downloadProject() {
    const blob = new Blob([editor.getValue()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = currentProject + ".verse";
    link.click();
}
