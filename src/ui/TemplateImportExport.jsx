import { useState } from 'react';
import { templateManager, STANDARDS } from '../constants/templateRegistry.js';

function TemplateImportExport({ isOpen, onClose, onImport }) {
  const [mode, setMode] = useState('export'); // 'export' or 'import'
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  if (!isOpen) return null;

  const templates = templateManager.getAllTemplates();
  const customTemplates = Object.values(templates).filter(t => t.isCustom);

  // 导出选中的模板
  const handleExport = () => {
    const toExport = selectedTemplates.length > 0 
      ? selectedTemplates 
      : Object.keys(templates);
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      templates: toExport.map(id => templates[id]).filter(Boolean)
    };
    
    setJsonText(JSON.stringify(exportData, null, 2));
    setSuccess(`已导出 ${exportData.templates.length} 个模板`);
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setSuccess('已复制到剪贴板');
    } catch (err) {
      setError('复制失败，请手动复制');
    }
  };

  // 导入模板
  const handleImport = () => {
    setError('');
    setSuccess('');
    
    if (!jsonText.trim()) {
      setError('请输入 JSON 数据');
      return;
    }

    try {
      const data = JSON.parse(jsonText);
      
      if (!data.templates || !Array.isArray(data.templates)) {
        setError('无效的模板数据格式');
        return;
      }

      let imported = 0;
      let skipped = 0;

      for (const template of data.templates) {
        if (!template.id || !template.name) {
          skipped++;
          continue;
        }

        // 检查是否已存在
        if (templates[template.id] && !templates[template.id].isCustom) {
          skipped++;
          continue;
        }

        // 创建自定义模板
        const newTemplate = templateManager.createCustomTemplate({
          name: template.name,
          description: template.description,
          docType: template.docType,
          standard: template.standard,
          category: template.category || '导入模板',
          styles: template.styles || {}
        });

        if (newTemplate) {
          imported++;
        }
      }

      setSuccess(`成功导入 ${imported} 个模板，跳过 ${skipped} 个`);
      if (imported > 0 && onImport) {
        onImport();
      }
    } catch (err) {
      setError('JSON 解析失败: ' + err.message);
    }
  };

  // 下载 JSON 文件
  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `公文模板_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess('文件已下载');
  };

  // 从文件导入
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
      setSuccess('文件已加载，点击"导入"按钮完成导入');
    };
    reader.onerror = () => {
      setError('文件读取失败');
    };
    reader.readAsText(file);
  };

  const toggleTemplate = (id) => {
    setSelectedTemplates(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div 
        className="w-[600px] max-h-[80vh] rounded-lg overflow-hidden flex flex-col"
        style={{ 
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 
            className="text-lg font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            模板导入/导出
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Mode Tabs */}
        <div 
          className="flex gap-1 p-1 m-4 rounded-md"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <button
            onClick={() => { setMode('export'); setJsonText(''); setError(''); setSuccess(''); }}
            className="flex-1 py-2 px-3 rounded text-[13px] font-medium transition-all"
            style={{ 
              background: mode === 'export' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: mode === 'export' ? 'var(--text-primary)' : 'var(--text-tertiary)'
            }}
          >
            导出模板
          </button>
          <button
            onClick={() => { setMode('import'); setJsonText(''); setError(''); setSuccess(''); }}
            className="flex-1 py-2 px-3 rounded text-[13px] font-medium transition-all"
            style={{ 
              background: mode === 'import' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: mode === 'import' ? 'var(--text-primary)' : 'var(--text-tertiary)'
            }}
          >
            导入模板
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {mode === 'export' ? (
            <>
              <p 
                className="text-sm mb-4"
                style={{ color: 'var(--text-tertiary)' }}
              >
                选择要导出的模板（不选则导出全部）
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-[200px] overflow-y-auto">
                {Object.values(templates).map(template => {
                  const standard = STANDARDS[template.standard];
                  const isSelected = selectedTemplates.includes(template.id);
                  
                  return (
                    <div
                      key={template.id}
                      onClick={() => toggleTemplate(template.id)}
                      className="p-3 rounded border cursor-pointer transition-all"
                      style={{
                        background: isSelected ? 'rgba(94, 106, 210, 0.1)' : 'transparent',
                        borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-subtle)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border flex items-center justify-center"
                          style={{ 
                            borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-standard)',
                            background: isSelected ? 'var(--brand-indigo)' : 'transparent'
                          }}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {template.name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {standard?.shortName}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
                  style={{ 
                    background: 'var(--brand-indigo)',
                    color: 'white'
                  }}
                >
                  生成 JSON
                </button>
              </div>

              {jsonText && (
                <>
                  <textarea
                    value={jsonText}
                    readOnly
                    className="w-full h-[150px] mt-4 p-3 rounded-md text-xs font-mono resize-none"
                    style={{ 
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-standard)',
                      color: 'var(--text-secondary)'
                    }}
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 px-4 py-2 rounded-md text-sm transition-colors"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      复制到剪贴板
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-4 py-2 rounded-md text-sm transition-colors"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      下载 JSON 文件
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <p 
                className="text-sm mb-4"
                style={{ color: 'var(--text-tertiary)' }}
              >
                粘贴模板 JSON 数据或上传文件
              </p>

              <div className="mb-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="template-file"
                />
                <label
                  htmlFor="template-file"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm cursor-pointer transition-colors border border-dashed"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'var(--border-standard)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  点击上传 JSON 文件
                </label>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={`{
  "version": "1.0",
  "templates": [
    {
      "id": "custom_xxx",
      "name": "我的模板",
      "docType": "qsh_redhead",
      "standard": "qsh_0758_2019"
    }
  ]
}`}
                className="w-full h-[200px] p-3 rounded-md text-xs font-mono resize-none"
                style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-standard)',
                  color: 'var(--text-primary)'
                }}
              />

              <button
                onClick={handleImport}
                className="w-full mt-4 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
                style={{ 
                  background: 'var(--brand-indigo)',
                  color: 'white'
                }}
              >
                导入模板
              </button>
            </>
          )}

          {/* Messages */}
          {error && (
            <div 
              className="mt-4 p-3 rounded-md text-sm flex items-center gap-2"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div 
              className="mt-4 p-3 rounded-md text-sm flex items-center gap-2"
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#34d399'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateImportExport;
