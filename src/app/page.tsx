"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Save, Copy, Moon, Sun, Download, Upload, Trash2, Code, PanelLeft, FileCode, Layout, Code2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { SaveSnippetDialog } from '@/components/save-snippet-dialog';
import { LoadSnippetDialog } from '@/components/load-snippet-dialog';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism-okaidia.css';


type Snippet = {
  id: number;
  name: string;
  html: string;
  css: string;
  js: string;
  react: string;
  date: string;
};

type ViewMode = "split" | "code" | "preview";

type EditorTab = 'html' | 'css' | 'js' | 'react';

export default function CodeCanvasPage() {
  const [htmlCode, setHtmlCode] = useState(`<div id="root"></div>`);
  
  const [cssCode, setCssCode] = useState(`body {
  font-family: sans-serif;
  padding: 20px;
}
.container {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 10px;
}
button {
  margin-top: 10px;
  padding: 8px 16px;
  cursor: pointer;
}`);
  
  const [jsCode, setJsCode] = useState(``);

  const [reactCode, setReactCode] = useState(`const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="container">
      <h1>Composant React</h1>
      <p>Compteur : {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Incrémenter
      </button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));`);

  const [activeTab, setActiveTab] = useState<EditorTab>('react');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
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
    
    let processedJs = jsCode;
    let finalHtml = htmlCode;
    let babelScript = '';
    let reactScripts = '';

    if (reactCode) {
      reactScripts = `
        <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
      `;
      babelScript = `<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`;
      processedJs = `<script type="text/babel" data-presets="react">${reactCode}</script>`;
    } else {
      processedJs = `<script>${jsCode}</script>`
    }


    const combinedCode = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${reactScripts}
        ${babelScript}
        <style>${cssCode}</style>
      </head>
      <body>
        ${finalHtml}
        ${processedJs}
      </body>
      </html>`;
    iframe.srcdoc = combinedCode;
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      generatePreview();
    }, 500);
    return () => clearTimeout(debounce);
  }, [htmlCode, cssCode, jsCode, reactCode]);

  const resetCode = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setReactCode('');
    toast({ title: "Code Réinitialisé", description: "L'éditeur a été vidé." });
  };

  const saveSnippet = (name: string) => {
    const newSnippet: Snippet = {
      id: Date.now(),
      name,
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      react: reactCode,
      date: new Date().toLocaleDateString(),
    };
    const updatedSnippets = [...savedSnippets, newSnippet];
    setSavedSnippets(updatedSnippets);
    localStorage.setItem('codeSnippets', JSON.stringify(updatedSnippets));
    setShowSaveModal(false);
    toast({ title: "Extrait Sauvegardé", description: `"${name}" a été sauvegardé.` });
  };

  const loadSnippet = (snippet: Snippet) => {
    setHtmlCode(snippet.html);
    setCssCode(snippet.css);
    setJsCode(snippet.js);
    setReactCode(snippet.react || '');
    setShowLoadModal(false);
    toast({ title: "Extrait Chargé", description: `"${snippet.name}" a été chargé.` });
  };

  const deleteSnippet = (id: number) => {
    const updatedSnippets = savedSnippets.filter(s => s.id !== id);
    setSavedSnippets(updatedSnippets);
    localStorage.setItem('codeSnippets', JSON.stringify(updatedSnippets));
    toast({ title: "Extrait Supprimé", variant: "destructive" });
  };

  const copyFullCode = () => {
    const fullCode = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Généré</title>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`;
    navigator.clipboard.writeText(fullCode);
    toast({ title: "Code Copié", description: "Le code HTML complet a été copié dans le presse-papiers." });
  };

  const exportHTML = () => {
    const fullCode = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exportation Canevas de Code</title>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`;
    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canevas-de-code.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const codeMap = {
    html: { code: htmlCode, setCode: setHtmlCode, lang: languages.markup },
    css: { code: cssCode, setCode: setCssCode, lang: languages.css },
    js: { code: jsCode, setCode: setJsCode, lang: languages.js },
    react: { code: reactCode, setCode: setReactCode, lang: languages.jsx }
  };

  const renderEditor = (tab: EditorTab) => {
    const { code, setCode, lang } = codeMap[tab];
    return (
      <div className="editor-container">
        <Editor
          value={code}
          onValueChange={newCode => setCode(newCode)}
          highlight={code => highlight(code, lang, tab).split('\\n').map(line => `<span class="token-line">${line}</span>`).join('\\n')}
          padding={10}
          className="editor"
          textareaId={`${tab}-editor`}
          autoFocus={tab === activeTab}
          preClassName="editor-pre"
        />
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <header className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <div className="flex items-center gap-3">
            <FileCode className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-bold">Canevas de Code</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if(value) setViewMode(value as ViewMode)}} size="sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="split" aria-label="Vue partagée">
                    <Layout className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Partagée</span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent><p>Vue Partagée</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="code" aria-label="Vue code">
                    <Code2 className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Code</span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent><p>Vue Code</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="preview" aria-label="Vue aperçu">
                    <Eye className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Aperçu</span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent><p>Aperçu en direct</p></TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowLoadModal(true)}><Upload className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Charger un Extrait</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowSaveModal(true)}><Save className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Sauvegarder l'Extrait</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={copyFullCode}><Copy className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Copier en HTML</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={exportHTML}><Download className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Exporter en HTML</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={resetCode}><RotateCcw className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Réinitialiser le Code</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Changer le Thème</p></TooltipContent>
            </Tooltip>
          </div>
        </header>
        <main className={cn(
          "flex-1 grid gap-0",
          viewMode === 'split' && 'grid-cols-1 lg:grid-cols-2',
          viewMode === 'code' && 'grid-cols-1',
          viewMode === 'preview' && 'grid-cols-1',
        )}>
          <div className={cn(
            "flex flex-col h-full",
            viewMode === 'preview' && 'hidden'
          )}>
            <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as EditorTab)} className="flex-1 flex flex-col">
              <TabsList className="rounded-none bg-transparent justify-start px-2 pt-2 border-b">
                <TabsTrigger value="html" className="text-orange-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none">HTML</TabsTrigger>
                <TabsTrigger value="css" className="text-blue-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">CSS</TabsTrigger>
                <TabsTrigger value="js" className="text-yellow-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 rounded-none">JS</TabsTrigger>
                <TabsTrigger value="react" className="text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none">REACT</TabsTrigger>
              </TabsList>
              {Object.keys(codeMap).map(key => (
                <TabsContent key={key} value={key} className="flex-1 m-0 overflow-auto">
                  {renderEditor(key as EditorTab)}
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <div className={cn(
            "flex flex-col h-full border-l bg-muted/20",
             viewMode === 'code' && 'hidden'
          )}>
             <div className="flex-1 p-2">
                <iframe
                    ref={iframeRef}
                    className="w-full h-full border bg-white rounded-md"
                    title="Aperçu du Code"
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
