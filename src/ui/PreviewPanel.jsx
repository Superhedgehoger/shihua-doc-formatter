import { STANDARDS, DOC_TYPES } from '../constants/templateRegistry.js';

function PreviewPanel({ 
  structure, 
  onUpdateBlock, 
  onExport, 
  isExporting, 
  validations, 
  currentTemplate 
}) {
  const hasErrors = validations.some(v => v.level === 'error');
  const hasWarnings = validations.some(v => v.level === 'warning');

  // 获取当前公文类型信息
  const docType = Object.values(DOC_TYPES).find(dt => dt.id === currentTemplate?.docType);
  const standard = STANDARDS[currentTemplate?.standard];

  const getBlockClass = (type) => {
    const classes = {
      h1: 'font-bold',
      h2: 'italic',
      h3: '',
      h4: '',
      h5: '',
      body: '',
      salutation: '',
      signoff: 'text-right pr-[4em]',
      signoffDate: 'text-center',
      attachment: ''
    };
    return classes[type] || '';
  };

  const getBlockStyle = (type) => {
    const baseStyle = {
      textIndent: ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'attachment'].includes(type) ? '2em' : '0',
      lineHeight: '28pt',
      marginBottom: '0'
    };
    return baseStyle;
  };

  if (!structure) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div 
          className="flex items-center justify-between px-6 py-3"
          style={{ 
            background: 'var(--bg-panel)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-3">
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              格式预览
            </span>
            {currentTemplate && (
              <span 
                className="text-xs px-2 py-0.5 rounded"
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-muted)'
                }}
              >
                {standard?.name} · {docType?.name}
              </span>
            )}
          </div>
        </div>

        {/* Empty State */}
        <div 
          className="flex-1 flex flex-col items-center justify-center"
          style={{ background: '#111' }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <svg 
              className="w-8 h-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ color: 'var(--text-muted)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-tertiary)' }}>
            点击「解析文档结构」预览排版效果
          </p>
          <p 
            className="text-xs mt-2"
            style={{ color: 'var(--text-muted)' }}
          >
            支持识别标题层级、落款、附件等内容
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div 
        className="flex items-center justify-between px-6 py-3"
        style={{ 
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="flex items-center gap-3">
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            格式预览
          </span>
          {currentTemplate && (
            <span 
              className="text-xs px-2 py-0.5 rounded flex items-center gap-2"
              style={{ 
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)'
              }}
            >
              <span>{currentTemplate.name}</span>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span>{standard?.name}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Validation Status */}
          {(hasErrors || hasWarnings) && (
            <div className="flex items-center gap-2">
              {hasErrors && (
                <span 
                  className="flex items-center gap-1.5 text-xs px-2 py-1 rounded"
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {validations.filter(v => v.level === 'error').length} 个错误
                </span>
              )}
              {hasWarnings && (
                <span 
                  className="flex items-center gap-1.5 text-xs px-2 py-1 rounded"
                  style={{ 
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b'
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {validations.filter(v => v.level === 'warning').length} 个警告
                </span>
              )}
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50"
            style={{ 
              background: hasErrors ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-standard)',
              color: hasErrors ? '#f59e0b' : 'var(--text-primary)'
            }}
          >
            {isExporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                导出中...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {hasErrors ? '有问题，仍导出' : '导出 .docx'}
                <span 
                  className="ml-1 px-1 py-0.5 rounded text-[10px]"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  ⌘S
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* A4 Preview */}
      <div 
        className="flex-1 overflow-auto p-8 flex flex-col items-center"
        style={{ background: '#111' }}
      >
        <div className="preview-page font-song text-base leading-7 text-black">
          {/* Title */}
          {structure.title && (
            <div className="preview-title mb-7">
              {structure.title}
            </div>
          )}

          {/* Salutation */}
          {structure.salutation && (
            <div className="preview-salutation mb-4">
              {structure.salutation}
            </div>
          )}

          {/* Body */}
          {structure.body?.map((block) => (
            <div
              key={block.id}
              className={`preview-block mb-0 ${getBlockClass(block.type)}`}
              style={getBlockStyle(block.type)}
            >
              {block.number && <span>{block.number}</span>}
              {block.text}
            </div>
          ))}

          {/* Attachments */}
          {structure.attachments?.length > 0 && (
            <div className="mt-6">
              {structure.attachments.map((att, i) => (
                <div 
                  key={i} 
                  className="preview-attachment"
                  style={{ textIndent: i === 0 ? '2em' : '4em' }}
                >
                  {i === 0 ? '附件：' : '　　　　'}
                  {i === 0 ? '' : `${i + 1}．`}
                  {att}
                </div>
              ))}
            </div>
          )}

          {/* Signoff */}
          {structure.signoff?.organization && (
            <div className="preview-signoff mt-8">
              {structure.signoff.organization}
            </div>
          )}
          {structure.signoff?.date && (
            <div className="preview-date">
              {structure.signoff.date}
            </div>
          )}
        </div>

        {/* Font Notice */}
        <div 
          className="mt-4 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          ⚠ 预览使用宋体近似，导出 .docx 后在 Word 中显示真实字体（{standard?.name}）
        </div>
      </div>
    </div>
  );
}

export default PreviewPanel;
