// CommonJS version
const fs = require('fs');
const path = require('path');

// Create the directory if it doesn't exist
if (!fs.existsSync('./public/monaco-tailwindcss')) {
    fs.mkdirSync('./public/monaco-tailwindcss', { recursive: true });
}

// Copy the Tailwind CSS worker from node_modules
const tailwindWorkerSrc = './node_modules/monaco-tailwindcss/tailwindcss.worker.js';
const tailwindWorkerDest = './public/monaco-tailwindcss/tailwindcss.worker.js';

if (fs.existsSync(tailwindWorkerSrc)) {
    fs.copyFileSync(tailwindWorkerSrc, tailwindWorkerDest);
    console.log('✅ Copied Tailwind CSS worker file');
} else {
    console.error('❌ Tailwind CSS worker file not found at:', tailwindWorkerSrc);
}

// Copy Monaco editor workers from ESM directory
const monacoDir = './node_modules/monaco-editor/esm/vs';
const workerFiles = [
    'editor/editor.worker.js',
    'language/css/css.worker.js',
    'language/html/html.worker.js',
    'language/json/json.worker.js',
    'language/typescript/ts.worker.js'
];

workerFiles.forEach((workerFile) => {
    const src = path.join(monacoDir, workerFile);
    const filename = path.basename(workerFile);
    const dest = path.join('./public', filename);

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${filename}`);
    } else {
        console.error(`❌ Worker file not found: ${src}`);
    }
});

console.log('Monaco editor worker files have been copied to the public directory');
