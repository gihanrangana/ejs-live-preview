/// <reference types="vite/client" />
declare module 'ejs/ejs.min.js';

// Add global EJS declaration for the CDN version
interface Window {
    ejs: {
        render: (template: string, data: any, options?: any) => string;
    };
}
