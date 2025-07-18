"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Save, Copy, Moon, Sun, Download, Upload, Trash2, Code, PanelLeft, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { SaveSnippetDialog } from '@/components/save-snippet-dialog';
import { LoadSnippetDialog } from '@/components/load-snippet-dialog';

type Snippet = {
  id: number;
  name: string;
  html: string;
  css: string;
  js: string;
  date: string;
};

export default function CodeCanvasPage() {
  const [htmlCode, setHtmlCode] = useState(`<div class="container">
  <h1>Hello World!</h1>
  <p>Welcome to the code editor</p>
  <button onclick="changeColor()">Change Color</button>
</div>`);
  
  const [cssCode, setCssCode] = useState(`.container {
  font-family: sans-serif;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  margin: 20px;
  transition: background 0.5s ease;
}
h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
}
button {
  background: #fff;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: all 0.3s;
}
button:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}`);
  
  const [jsCode, setJsCode] = useState(`function changeColor() {
  const container = document.querySelector('.container');
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  container.style.background = randomColor;
}`);

  const [activeTab, setActiveTab] = useState('html');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const theme = localStorage.getItem('code-canvas-theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    const saved = JSON.parse(localStorage.getItem('codeSnippets') || '[]');
    setSavedSnippets(saved);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('code-canvas-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('code-canvas-theme', 'light');
    }
  }, [isDarkMode]);

  const generatePreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const combinedCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
        <script>${jsCode}<\/script>
      </body>
      </html>`;
    iframe.srcdoc = combinedCode;
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      generatePreview();
    }, 300);
    return () => clearTimeout(debounce);
  }, [htmlCode, cssCode, jsCode]);

  const resetCode = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    toast({ title: "Code Reset", description: "The editor has been cleared." });
  };

  const saveSnippet = (name: string) => {
    const newSnippet: Snippet = {
      id: Date.now(),
      name,
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      date: new Date().toLocaleDateString(),
    };
    const updatedSnippets = [...savedSnippets, newSnippet];
    setSavedSnippets(updatedSnippets);
    localStorage.setItem('codeSnippets', JSON.stringify(updatedSnippets));
    setShowSaveModal(false);
    toast({ title: "Snippet Saved", description: `"${name}" has been saved.` });
  };

  const loadSnippet = (snippet: Snippet) => {
    setHtmlCode(snippet.html);
    setCssCode(snippet.css);
    setJsCode(snippet.js);
    setShowLoadModal(false);
    toast({ title: "Snippet Loaded", description: `"${snippet.name}" has been loaded.` });
  };

  const deleteSnippet = (id: number) => {
    const updatedSnippets = savedSnippets.filter(s => s.id !== id);
    setSavedSnippets(updatedSnippets);
    localStorage.setItem('codeSnippets', JSON.stringify(updatedSnippets));
    toast({ title: "Snippet Deleted", variant: "destructive" });
  };

  const copyFullCode = () => {
    const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Code</title>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}<\/script>
</body>
</html>`;
    navigator.clipboard.writeText(fullCode);
    toast({ title: "Code Copied", description: "The full HTML has been copied to your clipboard." });
  };

  const exportHTML = () => {
    const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Canvas Export</title>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}<\/script>
</body>
</html>`;
    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-canvas.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const codeMap = { html: htmlCode, css: cssCode, js: jsCode };
  const setCodeMap = { html: setHtmlCode, css: setCssCode, js: setJsCode };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <header className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <div className="flex items-center gap-3">
            <FileCode className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-bold">Code Canvas</h1>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowLoadModal(true)}><Upload className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Load Snippet</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowSaveModal(true)}><Save className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Save Snippet</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={copyFullCode}><Copy className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Copy HTML</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={exportHTML}><Download className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Export as HTML</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={resetCode}><RotateCcw className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Reset Code</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Toggle Theme</p></TooltipContent>
            </Tooltip>
          </div>
        </header>
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 border-t">
          <div className="flex flex-col h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="rounded-none bg-transparent justify-start px-2 pt-2 border-b">
                <TabsTrigger value="html" className="text-orange-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none">HTML</TabsTrigger>
                <TabsTrigger value="css" className="text-blue-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">CSS</TabsTrigger>
                <TabsTrigger value="js" className="text-yellow-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 rounded-none">JS</TabsTrigger>
              </TabsList>
              {Object.keys(codeMap).map(key => (
                <TabsContent key={key} value={key} className="flex-1 m-0">
                  <Textarea
                    value={codeMap[key as keyof typeof codeMap]}
                    onChange={(e) => setCodeMap[key as keyof typeof setCodeMap](e.target.value)}
                    className="w-full h-full resize-none font-mono text-sm p-4 border-0 rounded-none focus-visible:ring-0 bg-card"
                    placeholder={`Write your ${key.toUpperCase()} code here...`}
                    spellCheck={false}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <div className="flex flex-col h-full border-l bg-muted/20">
             <div className="flex items-center gap-2 px-4 py-2 border-b text-sm font-semibold text-muted-foreground">
                <PanelLeft className="w-4 h-4" />
                <span>Live Preview</span>
             </div>
             <div className="flex-1 p-2">
                <iframe
                    ref={iframeRef}
                    className="w-full h-full border bg-white rounded-md"
                    title="Code Preview"
                    sandbox="allow-scripts allow-modals"
                />
             </div>
          </div>
        </main>
      </div>
      <SaveSnippetDialog open={showSaveModal} onOpenChange={setShowSaveModal} onSave={saveSnippet} />
      <LoadSnippetDialog open={showLoadModal} onOpenChange={setShowLoadModal} snippets={savedSnippets} onLoad={loadSnippet} onDelete={deleteSnippet} />
    </TooltipProvider>
  );
}
