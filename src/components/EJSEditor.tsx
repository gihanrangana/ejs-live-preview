import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { configureMonacoTailwindcss, tailwindcssData } from 'monaco-tailwindcss';

// Configure Monaco worker paths
self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: string, label: string) {
        if (label === 'tailwindcss') {
            return './monaco-tailwindcss/tailwindcss.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.js';
        }
        if (label === 'json') {
            return './json.worker.js';
        }
        if (label === 'javascript' || label === 'typescript') {
            return './ts.worker.js';
        }
        return './editor.worker.js';
    }
};

interface EJSEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: 'html' | 'json';
    placeholder?: string;
}

const EJSEditor: React.FC<EJSEditorProps> = ({ value, onChange, language = 'html' }) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount = (
        editor: monaco.editor.IStandaloneCodeEditor,
        monaco: typeof import('monaco-editor')
    ) => {
        editorRef.current = editor;

        // Configure editor options
        editor.updateOptions({
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
                other: true,
                comments: false,
                strings: false
            },
            parameterHints: {
                enabled: true
            },
            folding: true,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            glyphMargin: false,
            contextmenu: true,
            mouseWheelZoom: true,
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            tabSize: 2,
            insertSpaces: true
        });
    };

    const handleEditorWillMount = (monaco: any) => {
        // Set the theme
        monaco.editor.setTheme('vs-dark');

        try {
            // Safely configure Tailwind CSS
            monaco.languages.css.cssDefaults.setOptions({
                data: {
                    dataProviders: {
                        tailwindcssData
                    }
                }
            });

            configureMonacoTailwindcss(monaco);
        } catch (error) {
            console.error('Error configuring Tailwind CSS for Monaco:', error);
        }
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onChange(value);
        }
    };

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                language={language === 'html' ? 'html' : 'json'}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                beforeMount={handleEditorWillMount}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true
                }}
            />
        </div>
    );
};

export default EJSEditor;
