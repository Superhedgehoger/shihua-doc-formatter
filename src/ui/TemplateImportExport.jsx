import { useState, useEffect } from 'react';
import { templateManager } from '../constants/templateRegistry.js';

/**
 * 模板导入导出组件
 * 支持 JSON 格式的模板配置导入导出
 */
function TemplateImportExport({ isOpen, onClose, onImport }) {
  const [mode, setMode] = useState('export'); // 'export' | 'import' | 'batch'
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      const templates = templateManager.getAllTemplates();
      setAllTemplates(templates);
      // 默认选中所有自定义模板
      const customIds = templates.filter(t => t.isCustom).map(t => t.id);
      setSelectedTemplates(customIds);
      setMode('export');
      setJsonText('');
      setFileName('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 生成导出 JSON
  const generateExportJson = () => {
    const templatesToExport = allTemplates.filter(t => selectedTemplates.includes(t.id));
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tool: 'shihua-doc-formatter',
      count: templatesToExport.length,
      templates: templatesToExport.map(t => t.toJSON())
    };
    return JSON.stringify(exportData, null, 2);
  };

  // 处理导出
  const handleExport = () => {
    const json = generateExportJson();
    setJsonText(json);
    
    // 自动下载
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `公文模板配置_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess('导出成功！文件已下载');
    setTimeout(() => setSuccess(''), 3000);
  };

  // 处理导入
  const handleImport = () => {
    setError('');
    setSuccess('');
    
    try {
      const data = JSON.parse(jsonText);
      
      // 验证数据结构
      if (!data.templates || !Array.isArray(data.templates)) {
        throw new Error('无效的模板文件格式：缺少 templates 数组');
      }
      
      let importedCount = 0;
      let skippedCount = 0;
      const errors = [];
      
      for (const template of data.templates) {
        try {
          // 验证必要字段
          if (!template.name || !template.standard || !template.docType) {
            errors.push(`模板 "${template.name || '未命名'}" 缺少必要字段`);
            continue;
          }
          
          // 检查是否已存在同名模板
          const existing = allTemplates.find(t => t.name === template.name);
          if (existing) {
            skippedCount++;
            continue;
          }
          
          // 创建新模板
          templateManager.addCustomTemplate({
            name: template.name,
            description: template.description || '',
            standard: template.standard,
            docType: template.docType,
            margins: template.margins,
            styles: template.styles,
            features: template.features
          });
          
          importedCount++;
        } catch (e) {
          errors.push(`导入 "${template.name || '未命名'}" 失败: ${e.message}`);
        }
      }
      
      if (importedCount > 0) {
        onImport();
        setSuccess(`成功导入 ${importedCount} 个模板${skippedCount > 0 ? `，跳过 ${skippedCount} 个重复模板` : ''}`);
      } else if (skippedCount > 0) {
        setError(`所有模板都已存在，共跳过 ${skippedCount} 个`);
      }
      
      if (errors.length > 0 && importedCount === 0) {
        setError(errors.join('; '));
      }
      
      setTimeout(() => {
        if (importedCount > 0) {
          onClose();
        }
      }, 1500);
      
    } catch (e) {
      setError(`解析失败: ${e.message}`);
    }
  };

  // 处理文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
      setError('');
    };
    reader.onerror = () => {
      setError('文件读取失败');
    };
    reader.readAsText(file);
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setSuccess('已复制到剪贴板');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('复制失败');
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTemplates.length === allTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(allTemplates.map(t => t.id));
    }
  };

  // 切换单个选择
  const toggleSelect = (id) => {
    setSelectedTemplates(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-[700px] max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
        style={{ 
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--success)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div>
              <h2 
                className="text-lg font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                导入 / 导出
              </h2>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                模板配置的备份与恢复
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Mode Tabs */}
        <div 
          className="flex gap-1 p-2 px-6"
          style={{ 
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          {[
            { id: 'export', label: '导出配置', icon: '↓' },
            { id: 'import', label: '导入配置', icon: '↑' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                setError('');
                setSuccess('');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ 
                background: mode === tab.id ? 'rgba(94, 106, 210, 0.15)' : 'transparent',
                color: mode === tab.id ? 'var(--brand-indigo)' : 'var(--text-tertiary)'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 导出模式 */}
          {mode === 'export' && (
            <div className="space-y-4">
              {/* 模板选择 */}
              <div 
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    选择要导出的模板
                  </h3>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs transition-colors hover:text-white"
                    style={{ color: 'var(--brand-indigo)' }}
                  >
                    {selectedTemplates.length === allTemplates.length ? '取消全选' : '全选'}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {allTemplates.map(template => (
                    <label 
                      key={template.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={() => toggleSelect(template.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {template.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {template.isCustom ? '自定义' : '内置'} · {template.standard}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                
                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  已选择 {selectedTemplates.length} 个模板
                </p>
              </div>

              {/* 导出预览 */}
              {jsonText && (
                <div 
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      导出预览
                    </h3>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      复制
                    </button>
                  </div>
                  <pre 
                    className="p-3 rounded-lg text-xs overflow-auto max-h-[200px]"
                    style={{ 
                      background: 'rgba(0,0,0,0.3)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {jsonText.slice(0, 1000)}
                    {jsonText.length > 1000 && '...'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 导入模式 */}
          {mode === 'import' && (
            <div className="space-y-4">
              {/* 文件上传 */}
              <div 
                className="p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors hover:border-white/20"
                style={{ borderColor: 'var(--border-standard)' }}
                onClick={() => document.getElementById('template-file-input').click()}
              >
                <input
                  id="template-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  点击选择 JSON 文件
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  或将文件拖拽到此处
                </p>
                {fileName && (
                  <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>
                    已选择: {fileName}
                  </p>
                )}
              </div>

              {/* 或直接粘贴 JSON */}
              <div 
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <h3 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  或直接粘贴配置 JSON
                </h3>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={`{\n  "version": "1.0",\n  "templates": [...]\n}`}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none font-mono"
                  style={{ 
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          )}

          {/* 状态提示 */}
          {error && (
            <div 
              className="mt-4 p-3 rounded-lg flex items-center gap-2"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span className="text-sm" style={{ color: 'var(--error)' }}>{error}</span>
            </div>
          )}
          
          {success && (
            <div 
              className="mt-4 p-3 rounded-lg flex items-center gap-2"
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <span className="text-sm" style={{ color: 'var(--success)' }}>{success}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ 
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            取消
          </button>
          
          {mode === 'export' ? (
            <button
              onClick={handleExport}
              disabled={selectedTemplates.length === 0}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              style={{ 
                background: 'var(--brand-indigo)',
                color: 'white'
              }}
            >
              导出 {selectedTemplates.length > 0 && `(${selectedTemplates.length})`}
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={!jsonText.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              style={{ 
                background: 'var(--success)',
                color: 'white'
              }}
            >
              导入配置
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateImportExport;
