function ValidationPanel({ validations }) {
  if (!validations || validations.length === 0) {
    return (
      <div 
        className="px-6 py-3 flex items-center gap-2"
        style={{ 
          background: 'var(--bg-panel)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--success)' }}
        ></span>
        <span 
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          文档符合规范
        </span>
      </div>
    );
  }

  const errors = validations.filter(v => v.level === 'error');
  const warnings = validations.filter(v => v.level === 'warning');

  return (
    <div 
      className="max-h-[180px] overflow-hidden flex flex-col"
      style={{ 
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-subtle)'
      }}
    >
      {/* Header */}
      <div 
        className="px-6 py-3 flex items-center justify-between"
        style={{ borderBottom: validations.length > 0 ? '1px solid var(--border-subtle)' : 'none' }}
      >
        <div className="flex items-center gap-3">
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            规范校验
          </span>
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <span 
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444'
                }}
              >
                {errors.length} 错误
              </span>
            )}
            {warnings.length > 0 && (
              <span 
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ 
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b'
                }}
              >
                {warnings.length} 警告
              </span>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {validations.length > 0 && (
        <div className="overflow-y-auto py-1">
          {validations.map((v, i) => (
            <div 
              key={i}
              className="px-6 py-2.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
            >
              {v.level === 'error' ? (
                <svg 
                  className="w-4 h-4 flex-shrink-0 mt-0.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="#ef4444"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg 
                  className="w-4 h-4 flex-shrink-0 mt-0.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="#f59e0b"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <div className="flex-1 min-w-0">
                <p 
                  className="text-sm"
                  style={{ 
                    color: v.level === 'error' ? '#fca5a5' : '#fcd34d'
                  }}
                >
                  {v.message}
                </p>
                {v.field && (
                  <p 
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    位置: {v.field}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ValidationPanel;
