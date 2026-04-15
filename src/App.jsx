import { useState, useEffect, useCallback } from 'react';
import InputPanel from './ui/InputPanel.jsx';
import PreviewPanel from './ui/PreviewPanel.jsx';
import ValidationPanel from './ui/ValidationPanel.jsx';
import TemplateManager from './ui/TemplateManager.jsx';
import TemplateImportExport from './ui/TemplateImportExport.jsx';
import TemplateGenerator from './ui/TemplateGenerator.jsx';
import { analyzeStructure } from './core/structureAnalyzer.js';
import { validateDocument } from './core/validationEngine.js';
import { injectAndDownload } from './core/templateInjector.js';
import { 
  templateManager, 
  getDefaultTemplateForDocType,
  STANDARDS 
} from './constants/templateRegistry.js';

function App() {
  // === 状态管理 ===
  const [currentTemplate, setCurrentTemplate] = useState(() => {
    // 默认使用石化红头文件模板
    return templateManager.getTemplate('qsh_redhead');
  });
  const [text, setText] = useState('');
  const [metadata, setMetadata] = useState({});
  
  // 解析状态
  const [structure, setStructure] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  
  // 校验状态
  const [validations, setValidations] = useState([]);
  
  // 导出状态
  const [isExporting, setIsExporting] = useState(false);

  // 模板管理器状态
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);

  // === 校验：结构变化时自动校验 ===
  useEffect(() => {
    if (structure) {
      const results = validateDocument(structure);
      setValidations(results.results);
    } else {
      setValidations([]);
    }
  }, [structure]);

  // === 键盘快捷键 ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter: 解析
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isAnalyzing && text.trim()) {
        e.preventDefault();
        handleAnalyze();
      }
      // Ctrl+S: 导出
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && structure && !isExporting) {
        e.preventDefault();
        handleExport();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isAnalyzing, structure, isExporting]);

  // === 处理模板选择 ===
  const handleSelectTemplate = (template) => {
    setCurrentTemplate(template);
    // 清空解析结果，让用户重新解析
    setStructure(null);
  };

  // === 处理公文类型变化 ===
  const handleDocTypeChange = (docTypeId) => {
    // 查找该类型对应的默认模板
    const defaultTemplate = getDefaultTemplateForDocType(docTypeId);
    if (defaultTemplate) {
      setCurrentTemplate(defaultTemplate);
    } else {
      // 如果没有找到，尝试找相同类型的其他模板
      const templates = templateManager.getTemplatesByType(docTypeId);
      if (templates.length > 0) {
        setCurrentTemplate(templates[0]);
      }
    }
    setStructure(null);
  };

  // === 处理解析（本地规则，无需 API）===
  const handleAnalyze = async () => {
    if (!text.trim()) {
      setAnalysisError('请输入文档内容');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    setStructure(null);

    try {
      // 使用本地规则解析（非 AI）
      const result = analyzeStructure(text, currentTemplate.docType, metadata);
      setStructure(result);
    } catch (err) {
      console.error('解析失败:', err);
      setAnalysisError(err.message || '解析失败，请检查输入格式');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // === 处理段落更新 ===
  const handleUpdateBlock = useCallback((blockId, updates) => {
    if (!structure) return;
    
    setStructure(prev => ({
      ...prev,
      body: prev.body.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    }));
  }, [structure]);

  // === 处理导出 ===
  const handleExport = async () => {
    if (!structure) return;

    setIsExporting(true);
    try {
      const result = await injectAndDownload(structure, metadata, currentTemplate);
      console.log('导出成功:', result.fileName);
    } catch (err) {
      console.error('导出失败:', err);
      alert(`导出失败: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // === 处理文档修复 ===
  const handleDocumentFix = (fixedDocument) => {
    setStructure(fixedDocument);
  };

  // === 处理导入完成 ===
  const handleImportComplete = () => {
    // 刷新模板列表
    setShowImportExport(false);
  };

  // 获取当前标准的名称
  const currentStandard = STANDARDS[currentTemplate?.standard];

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Linear 风格头部 */}
      <header 
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ 
          background: 'var(--bg-panel)', 
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div 
            className="w-8 h-8 flex items-center justify-center rounded-lg font-semibold text-sm"
            style={{ background: 'var(--brand-indigo)' }}
          >
            石
          </div>
          <div className="flex items-baseline gap-2">
            <span 
              className="text-base font-medium tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              石化公文
            </span>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              自动排版
            </span>
          </div>

          {/* 标准分隔线 */}
          <div 
            className="h-4 w-px mx-2"
            style={{ background: 'var(--border-subtle)' }}
          />

          {/* 当前标准显示 */}
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-md text-xs"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <span>{currentStandard?.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span>{currentTemplate?.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 模板管理按钮 */}
          <button
            onClick={() => setShowTemplateManager(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-white/5"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            模板管理
          </button>

          {/* 导入导出按钮 */}
          <button
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-white/5"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导入导出
          </button>

          {/* 模板生成按钮 */}
          <button
            onClick={() => setShowTemplateGenerator(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-white/5"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            生成模板
          </button>

          {/* 本地模式指示 */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs"
            style={{ 
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--success)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }}></span>
            本地解析模式
          </div>
          
          <button
            className="p-2 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={() => alert('快捷键：\n⌘/Ctrl + Enter - 开始解析\n⌘/Ctrl + S - 导出文档')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Linear 风格主体 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧输入面板 */}
        <aside 
          className="w-[420px] flex flex-col"
          style={{ 
            background: 'var(--bg-panel)',
            borderRight: '1px solid var(--border-subtle)'
          }}
        >
          <InputPanel
            currentTemplate={currentTemplate}
            onDocTypeChange={handleDocTypeChange}
            text={text}
            setText={setText}
            metadata={metadata}
            setMetadata={setMetadata}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
          
          {/* 错误提示 */}
          {analysisError && (
            <div 
              className="mx-4 mb-4 p-4 rounded-md text-sm"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '3px solid var(--error)',
                color: '#fca5a5'
              }}
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">解析失败</p>
                  <p className="mt-1 opacity-80">{analysisError}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* 右侧预览区 */}
        <div className="flex-1 flex flex-col" style={{ background: '#111' }}>
          <div className="flex-1 overflow-hidden">
            <PreviewPanel
              structure={structure}
              onUpdateBlock={handleUpdateBlock}
              onExport={handleExport}
              isExporting={isExporting}
              validations={validations}
              currentTemplate={currentTemplate}
            />
          </div>
          
          <ValidationPanel 
            document={structure || { title: metadata.title, body: [], metadata }}
            onFix={handleDocumentFix}
          />
        </div>
      </div>

      {/* 模板管理器弹窗 */}
      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplate={currentTemplate}
      />

      {/* 导入导出弹窗 */}
      <TemplateImportExport
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImport={handleImportComplete}
      />

      {/* 模板生成器弹窗 */}
      <TemplateGenerator
        isOpen={showTemplateGenerator}
        onClose={() => setShowTemplateGenerator(false)}
      />
    </div>
  );
}

export default App;
