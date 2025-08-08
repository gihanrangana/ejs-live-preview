import React, { useState, useEffect, useRef } from 'react';
import { Play, Code, Download, RotateCcw, Menu, X, Copy, Check } from 'lucide-react';

// Simple EJS-like template engine for browser use
const renderEJS = (template: string, data: any = {}): string => {
  try {
    // Handle basic EJS syntax: <% %>, <%= %>, <%- %>
    let result = template;
    
    // Replace <%- %> (unescaped output)
    result = result.replace(/<%-([\s\S]*?)%>/g, (match, code) => {
      try {
        const func = new Function(...Object.keys(data), `return ${code.trim()}`);
        return func(...Object.values(data));
      } catch (e) {
        return `[Error: ${e.message}]`;
      }
    });
    
    // Replace <%= %> (escaped output)
    result = result.replace(/<%=([\s\S]*?)%>/g, (match, code) => {
      try {
        const func = new Function(...Object.keys(data), `return ${code.trim()}`);
        const output = func(...Object.values(data));
        return String(output).replace(/[&<>"']/g, (char) => {
          const entities: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          };
          return entities[char] || char;
        });
      } catch (e) {
        return `[Error: ${e.message}]`;
      }
    });
    
    // Handle <% %> (code execution)
    result = result.replace(/<%([\s\S]*?)%>/g, (match, code) => {
      try {
        // Simple variable declarations and loops
        const trimmedCode = code.trim();
        
        if (trimmedCode.startsWith('if')) {
          // Handle simple if statements
          const condition = trimmedCode.match(/if\s*\((.*?)\)/)?.[1];
          if (condition) {
            const func = new Function(...Object.keys(data), `return ${condition}`);
            return func(...Object.values(data)) ? '' : '<!-- if condition false -->';
          }
        }
        
        if (trimmedCode.startsWith('for') || trimmedCode.startsWith('while')) {
          return '<!-- loop detected -->';
        }
        
        return '';
      } catch (e) {
        return `[Error: ${e.message}]`;
      }
    });
    
    return result;
  } catch (error) {
    return `<div style="color: red; padding: 20px; background: #ffe6e6; border-radius: 8px;">
      <h3>Template Error:</h3>
      <p>${error.message}</p>
    </div>`;
  }
};

const sampleTemplates = [
  {
    name: 'Basic Variables',
    template: `<div class="container">
  <h1>Welcome, <%= name %>!</h1>
  <p>You have <%= messages %> new messages.</p>
  <p>Today is <%= new Date().toLocaleDateString() %></p>
</div>`,
    data: { name: 'John Doe', messages: 5 }
  },
  {
    name: 'User Profile Card',
    template: `<div class="profile-card">
  <div class="avatar">
    <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" alt="Avatar">
  </div>
  <h2><%= user.name %></h2>
  <p class="title"><%= user.title %></p>
  <p class="email"><%= user.email %></p>
  <div class="stats">
    <div class="stat">
      <span class="number"><%= user.posts %></span>
      <span class="label">Posts</span>
    </div>
    <div class="stat">
      <span class="number"><%= user.followers %></span>
      <span class="label">Followers</span>
    </div>
  </div>
</div>

<style>
.profile-card {
  max-width: 300px;
  margin: 20px auto;
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}
.title {
  color: #666;
  margin: 10px 0;
}
.email {
  color: #999;
  font-size: 14px;
}
.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.stat {
  text-align: center;
}
.number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}
</style>`,
    data: {
      user: {
        name: 'Sarah Wilson',
        title: 'Senior Developer',
        email: 'sarah.wilson@example.com',
        posts: 127,
        followers: 1453
      }
    }
  },
  {
    name: 'Product Showcase',
    template: `<div class="product-showcase">
  <div class="product-grid">
    <% products.forEach(function(product) { %>
    <div class="product-card">
      <img src="<%= product.image %>" alt="<%= product.name %>">
      <h3><%= product.name %></h3>
      <p class="price">$<%= product.price %></p>
      <p class="description"><%= product.description %></p>
      <button class="buy-btn">Add to Cart</button>
    </div>
    <% }); %>
  </div>
</div>

<style>
.product-showcase {
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}
.product-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}
.product-card:hover {
  transform: translateY(-10px);
}
.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;
}
.product-card h3 {
  margin: 15px 0 10px 0;
  color: #333;
  font-size: 20px;
}
.price {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin: 10px 0;
}
.description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}
.buy-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.3s ease;
}
.buy-btn:hover {
  opacity: 0.9;
}
</style>`,
    data: {
      products: [
        {
          name: 'Wireless Headphones',
          price: 199,
          image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Premium noise-canceling wireless headphones with superior sound quality.'
        },
        {
          name: 'Smart Watch',
          price: 299,
          image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Advanced fitness tracking and smart notifications on your wrist.'
        }
      ]
    }
  }
];

function App() {
  const [template, setTemplate] = useState(sampleTemplates[0].template);
  const [data, setData] = useState(JSON.stringify(sampleTemplates[0].data, null, 2));
  const [preview, setPreview] = useState('');
  const [activeTab, setActiveTab] = useState<'template' | 'data'>('template');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const parsedData = JSON.parse(data);
      const rendered = renderEJS(template, parsedData);
      setPreview(rendered);
    } catch (error) {
      setPreview(`<div style="color: red; padding: 20px; background: #ffe6e6; border-radius: 8px;">
        <h3>Data Error:</h3>
        <p>Invalid JSON data: ${error.message}</p>
      </div>`);
    }
  }, [template, data]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('ejs-preview-template');
    const savedData = localStorage.getItem('ejs-preview-data');
    
    if (savedTemplate) setTemplate(savedTemplate);
    if (savedData) setData(savedData);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ejs-preview-template', template);
    localStorage.setItem('ejs-preview-data', data);
  }, [template, data]);

  const loadSample = (sample: typeof sampleTemplates[0]) => {
    setTemplate(sample.template);
    setData(JSON.stringify(sample.data, null, 2));
    setMobileMenuOpen(false);
  };

  const exportHtml = () => {
    const blob = new Blob([preview], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-output.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetToDefaults = () => {
    setTemplate(sampleTemplates[0].template);
    setData(JSON.stringify(sampleTemplates[0].data, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold">EJS Live Preview</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
            </button>
            <button
              onClick={exportHtml}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Sample Templates</h3>
              {sampleTemplates.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSample(sample)}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
                >
                  {sample.name}
                </button>
              ))}
              <div className="flex space-x-2 pt-2">
                <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center space-x-1 py-2 bg-green-600 rounded-lg text-sm">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button onClick={exportHtml} className="flex-1 flex items-center justify-center space-x-1 py-2 bg-blue-600 rounded-lg text-sm">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 h-screen">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Sample Templates</h3>
          <div className="space-y-2">
            {sampleTemplates.map((sample, index) => (
              <button
                key={index}
                onClick={() => loadSample(sample)}
                className="block w-full text-left px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Editor Section */}
          <div className="flex-1 flex flex-col bg-gray-800">
            {/* Editor Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('template')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'template'
                    ? 'bg-gray-700 text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Template
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'bg-gray-700 text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Data (JSON)
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4">
              {activeTab === 'template' ? (
                <textarea
                  ref={textareaRef}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full h-full bg-gray-900 text-white p-4 rounded-lg border border-gray-600 resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter your EJS template here..."
                  spellCheck={false}
                />
              ) : (
                <textarea
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full h-full bg-gray-900 text-white p-4 rounded-lg border border-gray-600 resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter JSON data here..."
                  spellCheck={false}
                />
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Live Preview</h3>
              <Play className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 overflow-auto">
              <div
                dangerouslySetInnerHTML={{ __html: preview }}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;