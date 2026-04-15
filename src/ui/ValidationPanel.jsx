import { useState } from 'react';
import { validateDocument, autoFixDocument } from '../core/validationEngine.js';

/**
 * 文档校验结果组件
 * 展示文档校验结果，支持一键修复
 */
function ValidationPanel({ document, onFix, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'error' | 'warning' | 'info'
  const [fixedIssues, setFixedIssues] = useState([]);

  // 执行校验
  const runValidation = () => {
    setIsValidating(true);
    
    // 模拟异步校验
    setTimeout(() => {
      const result = validateDocument(document);
      setValidation(result);
      setIsValidating(false);
      setIsExpanded(true);
      setFixedIssues([]);
    }, 300);
  };

  // 自动修复
  const handleAutoFix = () => {
    const fixResult = autoFixDocument(document);
    
    if (fixResult.fixCount > 0) {
      onFix?.(fixResult.document);
      setFixedIssues(fixResult.fixes.map(f => f.rule));
      
      // 重新校验
      setTimeout(() => {
        const newValidation = validateDocument(fixResult.document);
        setValidation(newValidation);
      }, 100);
    }
  };

  // 获取过滤后的结果
  const getFilteredResults = () => {
    if (!validation) return [];
    if (activeFilter === 'all') return validation.results;
    return validation.results.filter(r => r.level === activeFilter);
  };

  // 获取级别图标和颜色
  const getLevelStyle = (level) => {
    const styles = {
      error: {
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        ),
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        label: '错误'
      },
      warning: {
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ),
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
        color: '#f59e0b',
        label: '警告'
      },
      info: {
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        ),
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.2)',
        color: '#3b82f6',
        label: '提示'
      }
    };
    return styles[level] || styles.info;
  };

  const filteredResults = getFilteredResults();
  const canAutoFix = validation?.results.some(r => 
    !r.passed && ['title_punctuation', 'date_format'].includes(r.ruleId)
  );

  return (
    <div 
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ 
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          background: validation?.valid 
            ? 'rgba(16, 185, 129, 0.05)' 
            : validation?.errorCount > 0 
              ? 'rgba(239, 68, 68, 0.05)' 
              : validation?.warningCount > 0 
                ? 'rgba(245, 158, 11, 0.05)' 
                : 'transparent'
        }}
      >
        <div className="flex items-center gap-3">
          {/* 状态图标 */}
          {validation ? (
            validation.valid ? (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--success)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            ) : validation.errorCount > 0 ? (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--error)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </div>
            ) : (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--warning)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              </div>
            )
          ) : (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--border-standard)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
          )}
          
          <div>
            <h3 
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              文档校验
            </h3>
            {validation && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {validation.valid 
                  ? '文档格式正确' 
                  : `发现 ${validation.errorCount} 个错误, ${validation.warningCount} 个警告`
                }
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 校验按钮 */}
          {!validation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                runValidation();
              }}
              disabled={isValidating}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ 
                background: 'var(--brand-indigo)',
                color: 'white'
              }}
            >
              {isValidating ? '校验中...' : '开始校验'}
            </button>
          )}
          
          {/* 自动修复按钮 */}
          {canAutoFix && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAutoFix();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
              style={{ 
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              一键修复
            </button>
          )}
          
          {/* 展开/收起箭头 */}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--text-tertiary)" 
            strokeWidth="2"
            style={{ 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* 详细结果 */}
      {isExpanded && validation && (
        <div 
          className="border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {/* 筛选器 */}
          {validation.totalIssues > 0 && (
            <div 
              className="flex gap-2 p-3 px-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              {[
                { id: 'all', label: '全部', count: validation.totalIssues },
                { id: 'error', label: '错误', count: validation.errorCount },
                { id: 'warning', label: '警告', count: validation.warningCount },
                { id: 'info', label: '提示', count: validation.infoCount }
              ].map(filter => (
                filter.count > 0 && (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ 
                      background: activeFilter === filter.id 
                        ? filter.id === 'error' ? 'rgba(239, 68, 68, 0.15)' 
                          : filter.id === 'warning' ? 'rgba(245, 158, 11, 0.15)'
                          : filter.id === 'info' ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255,255,255,0.08)'
                        : 'transparent',
                      color: activeFilter === filter.id
                        ? filter.id === 'error' ? '#ef4444'
                          : filter.id === 'warning' ? '#f59e0b'
                          : filter.id === 'info' ? '#3b82f6'
                          : 'var(--text-primary)'
                        : 'var(--text-muted)'
                    }}
                  >
                    {filter.label} ({filter.count})
                  </button>
                )
              ))}
            </div>
          )}

          {/* 问题列表 */}
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {filteredResults.filter(r => !r.passed).length === 0 ? (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--text-muted)' }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <p className="text-sm">
                  {activeFilter === 'all' ? '没有发现任何问题' : '该类别下没有问题'}
                </p>
              </div>
            ) : (
              filteredResults
                .filter(r => !r.passed)
                .map((result, index) => {
                  const levelStyle = getLevelStyle(result.level);
                  const isFixed = fixedIssues.includes(result.ruleId);
                  
                  return (
                    <div
                      key={result.ruleId}
                      className="p-3 rounded-lg border transition-opacity"
                      style={{ 
                        background: levelStyle.bg,
                        borderColor: levelStyle.border,
                        opacity: isFixed ? 0.5 : 1
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div style={{ color: levelStyle.color }}>
                          {levelStyle.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-sm font-medium"
                              style={{ color: levelStyle.color }}
                            >
                              {result.ruleName}
                            </span>
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ 
                                background: 'rgba(255,255,255,0.1)',
                                color: 'var(--text-muted)'
                              }}
                            >
                              {result.category}
                            </span>
                            {isFixed && (
                              <span 
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ 
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  color: '#34d399'
                                }}
                              >
                                已修复
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {result.message}
                          </p>
                          
                          {result.suggestion && (
                            <div 
                              className="mt-2 p-2 rounded text-xs"
                              style={{ 
                                background: 'rgba(0,0,0,0.2)',
                                color: 'var(--text-tertiary)'
                              }}
                            >
                              <span style={{ color: 'var(--text-muted)' }}>建议：</span>
                              {result.suggestion}
                            </div>
                          )}
                          
                          {result.count && result.count > 1 && (
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              共 {result.count} 处
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* 底部信息 */}
          <div 
            className="px-4 py-2 text-xs flex justify-between items-center"
            style={{ 
              borderTop: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)'
            }}
          >
            <span>校验时间: {new Date(validation.timestamp).toLocaleString()}</span>
            <button
              onClick={runValidation}
              className="hover:text-white transition-colors"
            >
              重新校验
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationPanel;
