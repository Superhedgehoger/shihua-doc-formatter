import { useState } from 'react';
import { DOC_TYPES, getDocTypesByCategory } from '../constants/templateRegistry.js';

function InputPanel({ 
  currentTemplate,
  onDocTypeChange,
  text, 
  setText, 
  metadata, 
  setMetadata, 
  onAnalyze, 
  isAnalyzing 
}) {
  const [activeTab, setActiveTab] = useState('paste');

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const categories = getDocTypesByCategory();

  // 获取当前公文类型的信息
  const currentDocType = Object.values(DOC_TYPES).find(dt => dt.id === currentTemplate?.docType);

  // 判断字段是否显示
  const showField = (field) => {
    if (!currentDocType) return false;
    return currentDocType[field] === true;
  };

  return (
    <>
      {/* Panel Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 
          className="text-[15px] font-medium tracking-tight mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          输入文档
        </h2>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          粘贴文字或上传文件开始解析
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Doc Type Selector - 按分类显示 */}
        <div className="mb-5">
          <label 
            className="block text-[13px] font-medium mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            公文类型
          </label>
          <select
            value={currentTemplate?.docType || ''}
            onChange={(e) => onDocTypeChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md text-sm transition-all outline-none"
            style={{ 
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-standard)',
              color: 'var(--text-primary)'
            }}
          >
            {Object.entries(categories).map(([category, types]) => (
              <optgroup key={category} label={category}>
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p 
            className="text-xs mt-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {currentDocType?.description}
          </p>
        </div>

        {/* Tabs */}
        <div 
          className="flex gap-1 p-1 rounded-md mb-4"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <button
            onClick={() => setActiveTab('paste')}
            className="flex-1 py-2 px-3 rounded text-[13px] font-medium transition-all"
            style={{ 
              background: activeTab === 'paste' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'paste' ? 'var(--text-primary)' : 'var(--text-tertiary)'
            }}
          >
            粘贴文字
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className="flex-1 py-2 px-3 rounded text-[13px] font-medium transition-all"
            style={{ 
              background: activeTab === 'upload' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'upload' ? 'var(--text-primary)' : 'var(--text-tertiary)'
            }}
          >
            上传文件
          </button>
        </div>

        {/* Text Area */}
        {activeTab === 'paste' && (
          <div className="mb-5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请在此处粘贴公文内容..."
              className="w-full min-h-[200px] px-4 py-3.5 rounded-md text-sm resize-y outline-none transition-all"
              style={{ 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-standard)',
                color: 'var(--text-primary)',
                lineHeight: '1.6'
              }}
            />
            <div 
              className="text-right text-xs mt-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {text.length} 字符
            </div>
          </div>
        )}

        {/* File Upload */}
        {activeTab === 'upload' && (
          <div 
            className="mb-5 p-8 rounded-md text-center cursor-pointer transition-all"
            style={{ 
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-standard)',
              color: 'var(--text-tertiary)'
            }}
          >
            <svg 
              className="w-10 h-10 mx-auto mb-3 opacity-50" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm">点击或拖拽文件到此处</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              支持 .docx, .txt 格式
            </p>
          </div>
        )}

        {/* Metadata Section */}
        <div 
          className="rounded-lg p-4 mb-5"
          style={{ 
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h3 
            className="text-[13px] font-medium mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            元数据（可选）
          </h3>
          <div className="space-y-3">
            {/* 发文字号 */}
            {showField('hasFileNumber') && (
              <div>
                <label 
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  发文字号
                </label>
                <input
                  type="text"
                  value={metadata.file_number || ''}
                  onChange={(e) => handleMetadataChange('file_number', e.target.value)}
                  placeholder="销售工单鲁办〔2024〕1号"
                  className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            )}

            {/* 纪要编号 */}
            {showField('hasMeetingNumber') && (
              <div>
                <label 
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  纪要编号
                </label>
                <input
                  type="text"
                  value={metadata.meeting_number || ''}
                  onChange={(e) => handleMetadataChange('meeting_number', e.target.value)}
                  placeholder="第XX期"
                  className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            )}
            
            {/* 主送机关 */}
            {showField('hasSalutation') !== false && (
              <div>
                <label 
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  主送机关
                </label>
                <input
                  type="text"
                  value={metadata.salutation || ''}
                  onChange={(e) => handleMetadataChange('salutation', e.target.value)}
                  placeholder="各部门："
                  className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            )}

            {/* 发文机关 */}
            {showField('hasSignature') && (
              <div>
                <label 
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  发文机关
                </label>
                <input
                  type="text"
                  value={metadata.organization || ''}
                  onChange={(e) => handleMetadataChange('organization', e.target.value)}
                  placeholder="某某石油分公司"
                  className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            )}

            {/* 成文日期 */}
            <div>
              <label 
                className="block text-xs mb-1.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                成文日期
              </label>
              <input
                type="text"
                value={metadata.date || ''}
                onChange={(e) => handleMetadataChange('date', e.target.value)}
                placeholder="2024年1月15日"
                className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-standard)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* 抄送机关 */}
            {showField('hasDistribution') && (
              <div>
                <label 
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  抄送机关
                </label>
                <input
                  type="text"
                  value={metadata.cc || ''}
                  onChange={(e) => handleMetadataChange('cc', e.target.value)}
                  placeholder="多个用顿号分隔"
                  className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            )}

            {/* 拟稿部门/人（工作表单） */}
            {showField('hasApprovalTable') && (
              <>
                <div>
                  <label 
                    className="block text-xs mb-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    拟稿部门
                  </label>
                  <input
                    type="text"
                    value={metadata.dept || ''}
                    onChange={(e) => handleMetadataChange('dept', e.target.value)}
                    placeholder="综合管理部"
                    className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                    style={{ 
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-standard)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-xs mb-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    拟稿人
                  </label>
                  <input
                    type="text"
                    value={metadata.drafter || ''}
                    onChange={(e) => handleMetadataChange('drafter', e.target.value)}
                    placeholder="张三"
                    className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                    style={{ 
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-standard)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-xs mb-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    签发人
                  </label>
                  <input
                    type="text"
                    value={metadata.approver || ''}
                    onChange={(e) => handleMetadataChange('approver', e.target.value)}
                    placeholder="李四"
                    className="w-full px-3 py-2 rounded text-[13px] outline-none transition-all"
                    style={{ 
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-standard)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div 
        className="px-6 py-4"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !text.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            background: 'var(--brand-indigo)',
            color: 'white'
          }}
        >
          {isAnalyzing ? (
            <>
              <svg 
                className="w-4 h-4 animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在解析...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              开始解析
              <span 
                className="ml-2 px-1.5 py-0.5 rounded text-[11px]"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                ⌘↵
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

export default InputPanel;
