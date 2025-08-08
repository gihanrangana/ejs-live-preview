import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

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

        // Set the theme
        monaco.editor.setTheme('vs-dark');

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
