import { useState } from 'react';
import { generateTemplate, downloadTemplate, STANDARDS_CONFIG } from '../core/templateGenerator.js';
import { STANDARDS, DOC_TYPES } from '../constants/templateRegistry.js';

function TemplateGenerator({ isOpen, onClose }) {
  const [selectedStandard, setSelectedStandard] = useState('qsh_0758_2019');
  const [selectedDocType, setSelectedDocType] = useState('qsh_redhead');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const standard = STANDARDS[selectedStandard];
  const docType = DOC_TYPES[selectedDocType];

  const handleGenerate = () => {
    setIsGenerating(true);
    setMessage('');

    try {
      const blob = generateTemplate(selectedStandard, selectedDocType);
      const filename = `${docType?.name || '模板'}_${standard?.shortName || '标准'}.docx`;
      downloadTemplate(blob, filename);
      setMessage('模板已生成并下载');
    } catch (err) {
      setMessage('生成失败: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const standardsList = Object.entries(STANDARDS);
  const docTypesList = Object.entries(DOC_TYPES).filter(([id]) => 
    id.startsWith(selectedStandard.split('_')[0]) || id.startsWith('generic')
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div 
        className="w-[500px] max-h-[80vh] rounded-lg overflow-hidden flex flex-col"
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
          <div>
            <h2 
              className="text-lg font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              生成 Word 模板
            </h2>
            <p 
              className="text-sm mt-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              下载符合标准的空白公文模板
            </p>
          </div>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Standard Selection */}
          <div className="mb-6">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              选择标准
            </label>
            <div className="space-y-2">
              {standardsList.map(([id, std]) => {
                const config = STANDARDS_CONFIG[id];
                return (
                  <div
                    key={id}
                    onClick={() => setSelectedStandard(id)}
                    className="p-3 rounded-lg border cursor-pointer transition-all"
                    style={{
                      background: selectedStandard === id ? 'rgba(94, 106, 210, 0.1)' : 'transparent',
                      borderColor: selectedStandard === id ? 'var(--brand-indigo)' : 'var(--border-subtle)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border flex items-center justify-center"
                        style={{ 
                          borderColor: selectedStandard === id ? 'var(--brand-indigo)' : 'var(--border-standard)'
                        }}
                      >
                        {selectedStandard === id && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--brand-indigo)' }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {std.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          {std.description}
                        </p>
                        {config && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            边距: 上{(config.page.marginTop/567).toFixed(1)}cm 下{(config.page.marginBottom/567).toFixed(1)}cm 左{(config.page.marginLeft/567).toFixed(1)}cm 右{(config.page.marginRight/567).toFixed(1)}cm
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Type Selection */}
          <div className="mb-6">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              公文类型
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-standard)',
                color: 'var(--text-primary)'
              }}
            >
              {docTypesList.map(([id, type]) => (
                <option key={id} value={id}>{type.name} - {type.description}</option>
              ))}
            </select>
          </div>

          {/* Template Info */}
          {docType && (
            <div 
              className="p-4 rounded-lg mb-6"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <h4 
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                模板信息
              </h4>
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <p>类型: {docType.name}</p>
                <p>说明: {docType.description}</p>
                <p>层级: {docType.maxLevels} 级标题</p>
                {docType.features.signoff && <p>✓ 包含落款</p>}
                {docType.features.cc && <p>✓ 包含抄送</p>}
                {docType.features.attachments && <p>✓ 包含附件</p>}
                {docType.features.redLine && <p>✓ 红色分隔线</p>}
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div 
              className={`p-3 rounded-md text-sm flex items-center gap-2 ${
                message.includes('失败') ? 'text-red-400' : 'text-green-400'
              }`}
              style={{ 
                background: message.includes('失败') 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : 'rgba(16, 185, 129, 0.1)'
              }}
            >
              {message.includes('失败') ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              )}
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 flex items-center justify-between"
          style={{ 
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            style={{ 
              background: 'var(--brand-indigo)',
              color: 'white'
            }}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                </svg>
                生成中...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                下载模板
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateGenerator;
