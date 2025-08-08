import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface EJSEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'ejs' | 'json';
  placeholder?: string;
}

const EJSEditor: React.FC<EJSEditorProps> = ({ 
  value, 
  onChange, 
  language = 'ejs',
  placeholder = '' 
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;

    // Register EJS language if it doesn't exist
    if (!monaco.languages.getLanguages().find(lang => lang.id === 'ejs')) {
      // Register EJS language
      monaco.languages.register({ id: 'ejs' });

      // Define EJS syntax highlighting
      monaco.languages.setMonarchTokensProvider('ejs', {
        tokenizer: {
          root: [
            // EJS tags
            [/<%[-=]?/, { token: 'delimiter.ejs', next: '@ejsCode' }],
            [/%>/, 'delimiter.ejs'],
            
            // HTML tags
            [/<\/?[a-zA-Z][\w-]*(?=\s|>|$)/, 'html.tag'],
            [/<|>/, 'html.bracket'],
            
            // HTML attributes
            [/\s+[a-zA-Z-]+(?=\s*=)/, 'html.attribute.name'],
            [/=/, 'html.operator'],
            [/"[^"]*"/, 'html.attribute.value'],
            [/'[^']*'/, 'html.attribute.value'],
            
            // Comments
            [/<!--/, { token: 'html.comment', next: '@htmlComment' }],
            
            // Text content
            [/[^<]+/, 'html.text']
          ],

          ejsCode: [
            // JavaScript keywords in EJS
            [/\b(if|else|for|while|function|var|let|const|return|true|false|null|undefined)\b/, 'ejs.keyword'],
            
            // Operators
            [/[+\-*/%=<>!&|]+/, 'ejs.operator'],
            
            // Numbers
            [/\d+/, 'ejs.number'],
            
            // Strings
            [/"[^"]*"/, 'ejs.string'],
            [/'[^']*'/, 'ejs.string'],
            
            // Variables and functions
            [/[a-zA-Z_$][\w$]*/, 'ejs.variable'],
            
            // Brackets and punctuation
            [/[{}()\[\]]/, 'ejs.bracket'],
            [/[;,.]/, 'ejs.punctuation'],
            
            // End EJS tag
            [/%>/, { token: 'ejs.delimiter', next: '@pop' }]
          ],

          htmlComment: [
            [/-->/, { token: 'html.comment', next: '@pop' }],
            [/[^-]+/, 'html.comment'],
            [/-/, 'html.comment']
          ]
        }
      });

      // Define EJS theme colors
      monaco.editor.defineTheme('ejs-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          // EJS-specific tokens
          { token: 'ejs.delimiter', foreground: '#FF6B35', fontStyle: 'bold' },
          { token: 'ejs.keyword', foreground: '#569CD6' },
          { token: 'ejs.string', foreground: '#CE9178' },
          { token: 'ejs.number', foreground: '#B5CEA8' },
          { token: 'ejs.variable', foreground: '#9CDCFE' },
          { token: 'ejs.operator', foreground: '#D4D4D4' },
          { token: 'ejs.bracket', foreground: '#FFD700' },
          { token: 'ejs.punctuation', foreground: '#D4D4D4' },
          
          // HTML tokens - consistent colors
          { token: 'html.tag', foreground: '#569CD6' },
          { token: 'html.bracket', foreground: '#808080' },
          { token: 'html.attribute.name', foreground: '#92C5F8' },
          { token: 'html.attribute.value', foreground: '#CE9178' },
          { token: 'html.operator', foreground: '#D4D4D4' },
          { token: 'html.comment', foreground: '#6A9955', fontStyle: 'italic' },
          { token: 'html.text', foreground: '#D4D4D4' }
        ],
        colors: {
          'editor.background': '#222222',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#264F78',
          'editor.lineHighlightBackground': '#2A2D2E'
        }
      });

      // Set up auto-completion for EJS
      monaco.languages.registerCompletionItemProvider('ejs', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions = [
            // EJS syntax
            {
              label: '<%=',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<%= ${1:variable} %>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Output escaped value',
              range
            },
            {
              label: '<%-',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<%- ${1:variable} %>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Output unescaped value',
              range
            },
            {
              label: '<%',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<% ${1:code} %>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Execute JavaScript code',
              range
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<% if (${1:condition}) { %>\n\t${2:content}\n<% } %>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If statement',
              range
            },
            {
              label: 'for',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<% for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) { %>\n\t${3:content}\n<% } %>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop',
              range
            },
            {
              label: 'forEach',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<% ${1:array}.forEach(function(${2:item}) { %>\n\t${3:content}\n<% }); %>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'ForEach loop',
              range
            },
            // Common HTML elements
            {
              label: 'div',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<div class="${1:class}">\n\t${2:content}\n</div>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Div element',
              range
            },
            {
              label: 'h1',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<h1>${1:heading}</h1>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'H1 heading',
              range
            },
            {
              label: 'p',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<p>${1:paragraph}</p>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Paragraph',
              range
            },
            {
              label: 'img',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<img src="${1:url}" alt="${2:description}">',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Image element',
              range
            },
            {
              label: 'a',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<a href="${1:url}">${2:text}</a>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Anchor link',
              range
            }
          ];

          return { suggestions };
        }
      });
    }

    // Set the theme
    monaco.editor.setTheme('ejs-clean');

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
      automaticLayout: true,
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
        language={language === 'ejs' ? 'ejs' : 'json'}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="ejs-dark"
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