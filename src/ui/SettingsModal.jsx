import { useState, useEffect } from 'react';

function SettingsModal({ isOpen, onClose }) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0f1011] border border-white/[0.08] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <h2 className="text-base font-semibold text-white">设置</h2>
          <button 
            onClick={onClose}
            className="p-2 text-[#8a8f98] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Shortcuts */}
          <div>
            <h3 className="text-sm font-medium text-[#d0d6e0] mb-3">快捷键</h3>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a8f98]">开始解析</span>
                <kbd className="px-2 py-1 bg-white/[0.05] rounded text-[#d0d6e0] font-mono text-xs">⌘ + Enter</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a8f98]">导出文档</span>
                <kbd className="px-2 py-1 bg-white/[0.05] rounded text-[#d0d6e0] font-mono text-xs">⌘ + S</kbd>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-medium text-[#d0d6e0] mb-3">关于</h3>
            <div className="text-sm text-[#8a8f98] space-y-2">
              <p>石化公文自动排版工具</p>
              <p>遵循 Q/SH 0758—2019 标准</p>
              <p className="text-xs text-[#62666d] mt-4">纯前端处理，文件不上传服务器</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.05] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white text-sm font-medium rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
