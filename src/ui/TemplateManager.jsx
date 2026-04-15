import { useState, useEffect } from 'react';
import { 
  templateManager, 
  STANDARDS, 
  DOC_TYPES, 
  getDocTypesByCategory 
} from '../constants/templateRegistry.js';
import TemplateImportExport from './TemplateImportExport.jsx';
import TemplateGenerator from './TemplateGenerator.jsx';
import TemplateEditor from './TemplateEditor.jsx';

/**
 * 增强版模板管理器组件
 * 支持：列表、搜索、筛选、新建、编辑、克隆、删除、导入/导出
 */
function TemplateManager({ isOpen, onClose, onSelectTemplate, currentTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // 编辑器状态
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit' | 'clone'
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // 其他弹窗
  const [showImportExport, setShowImportExport] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  
  // 确认对话框
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // 加载模板列表
  useEffect(() => {
    if (isOpen) {
      refreshTemplates();
    }
  }, [isOpen]);

  const refreshTemplates = () => {
    setTemplates(templateManager.getAllTemplates());
  };

  if (!isOpen) return null;

  const categories = getDocTypesByCategory();
  
  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || 
      template.category === selectedCategory;
    const matchesStandard = selectedStandard === 'all' || 
      template.standard === selectedStandard;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStandard && matchesSearch;
  });

  // 内置模板和自定义模板分组
  const builtinTemplates = filteredTemplates.filter(t => !t.isCustom);
  const customTemplates = filteredTemplates.filter(t => t.isCustom);

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  // 打开编辑器 - 新建
  const handleCreateNew = () => {
    setEditingTemplate(null);
    setEditorMode('create');
    setShowEditor(true);
  };

  // 打开编辑器 - 编辑
  const handleEdit = (template, e) => {
    e?.stopPropagation();
    setEditingTemplate(template);
    setEditorMode('edit');
    setShowEditor(true);
  };

  // 打开编辑器 - 克隆
  const handleClone = (template, e) => {
    e?.stopPropagation();
    setEditingTemplate(template);
    setEditorMode('clone');
    setShowEditor(true);
  };

  // 保存模板
  const handleSaveTemplate = (formData) => {
    let savedTemplate;
    
    if (editorMode === 'edit' && editingTemplate?.isCustom) {
      // 更新现有自定义模板
      savedTemplate = templateManager.updateCustomTemplate(editingTemplate.id, formData);
    } else {
      // 创建新模板（新建或克隆）
      savedTemplate = templateManager.addCustomTemplate(formData);
    }
    
    if (savedTemplate) {
      refreshTemplates();
      setShowEditor(false);
      setEditingTemplate(null);
      
      // 如果是新建或克隆，自动选中
      if (editorMode === 'create' || editorMode === 'clone') {
        onSelectTemplate(savedTemplate);
      }
    }
  };

  // 删除确认
  const handleDeleteConfirm = (template, e) => {
    e?.stopPropagation();
    setConfirmData(template);
    setConfirmAction('delete');
    setShowConfirm(true);
  };

  // 执行删除
  const executeDelete = () => {
    if (confirmData && templateManager.deleteCustomTemplate(confirmData.id)) {
      refreshTemplates();
      setShowConfirm(false);
      setConfirmData(null);
    }
  };

  // 导出单个模板
  const handleExportSingle = (template, e) => {
    e?.stopPropagation();
    const json = templateManager.exportTemplate(template.id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `模板_${template.name}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStandardBadgeColor = (standardId) => {
    const colors = {
      qsh_0758_2019: { bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5' },
      gb_t_9704_2012: { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd' },
    };
    return colors[standardId] || { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-muted)' };
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div 
        className="w-[900px] max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
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
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--brand-indigo), #8b5cf6)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div>
              <h2 
                className="text-lg font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                模板管理器
              </h2>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                管理公文排版模板 · {templates.length} 个模板
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

        {/* Toolbar */}
        <div 
          className="px-6 py-3 flex items-center gap-3"
          style={{ 
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          {/* 新建按钮 */}
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ 
              background: 'var(--brand-indigo)',
              color: 'white'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            新建模板
          </button>

          {/* 次要操作 */}
          <div className="h-6 w-px mx-1" style={{ background: 'var(--border-subtle)' }} />
          
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            生成 Word
          </button>
          
          <button
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导入/导出
          </button>

          <div className="flex-1" />

          {/* 视图切换 */}
          <div 
            className="flex rounded-lg p-0.5"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="p-1.5 rounded-md transition-all"
              style={{ 
                background: viewMode === 'grid' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 rounded-md transition-all"
              style={{ 
                background: viewMode === 'list' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div 
          className="px-6 py-3 flex items-center gap-3"
          style={{ 
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          {/* 搜索 */}
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-standard)',
                color: 'var(--text-primary)'
              }}
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-muted)' }}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          {/* 标准筛选 */}
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-standard)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">所有标准</option>
            {Object.entries(STANDARDS).map(([id, standard]) => (
              <option key={id} value={id}>{standard.name}</option>
            ))}
          </select>

          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-standard)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">所有分类</option>
            {Object.entries(categories).map(([category, types]) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="flex-1" />
          
          <span 
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            显示 {filteredTemplates.length} 个模板
          </span>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div 
              className="h-full flex flex-col items-center justify-center text-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">没有找到模板</p>
              <p className="text-xs">尝试调整筛选条件或搜索关键词</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-6">
              {/* 自定义模板区域 */}
              {customTemplates.length > 0 && (
                <div>
                  <h3 
                    className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--success)' }}
                    />
                    自定义模板 ({customTemplates.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {customTemplates.map(template => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={currentTemplate?.id === template.id}
                        isCustom={true}
                        onSelect={() => handleSelectTemplate(template)}
                        onEdit={(e) => handleEdit(template, e)}
                        onClone={(e) => handleClone(template, e)}
                        onDelete={(e) => handleDeleteConfirm(template, e)}
                        onExport={(e) => handleExportSingle(template, e)}
                        standardBadge={getStandardBadgeColor(template.standard)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 内置模板区域 */}
              {builtinTemplates.length > 0 && (
                <div>
                  <h3 
                    className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--brand-indigo)' }}
                    />
                    内置模板 ({builtinTemplates.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {builtinTemplates.map(template => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={currentTemplate?.id === template.id}
                        isCustom={false}
                        onSelect={() => handleSelectTemplate(template)}
                        onClone={(e) => handleClone(template, e)}
                        onExport={(e) => handleExportSingle(template, e)}
                        standardBadge={getStandardBadgeColor(template.standard)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 列表视图
            <div className="space-y-2">
              {filteredTemplates.map(template => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  isSelected={currentTemplate?.id === template.id}
                  isCustom={template.isCustom}
                  onSelect={() => handleSelectTemplate(template)}
                  onEdit={(e) => handleEdit(template, e)}
                  onClone={(e) => handleClone(template, e)}
                  onDelete={(e) => handleDeleteConfirm(template, e)}
                  onExport={(e) => handleExportSingle(template, e)}
                  standardBadge={getStandardBadgeColor(template.standard)}
                />
              ))}
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
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{builtinTemplates.length} 个内置</span>
            <span>{customTemplates.length} 个自定义</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            关闭
          </button>
        </div>
      </div>

      {/* 子组件 */}
      <TemplateEditor
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        mode={editorMode}
      />

      <TemplateImportExport
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImport={refreshTemplates}
      />

      <TemplateGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
      />

      {/* 确认对话框 */}
      {showConfirm && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowConfirm(false)}
        >
          <div 
            className="w-[400px] rounded-xl p-6"
            style={{ 
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              确认删除
            </h3>
            <p 
              className="text-sm mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              确定要删除模板 "{confirmData?.name}" 吗？此操作无法撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  background: 'var(--error)',
                  color: 'white'
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 模板卡片组件
function TemplateCard({ 
  template, 
  isSelected, 
  isCustom, 
  onSelect, 
  onEdit, 
  onClone, 
  onDelete, 
  onExport,
  standardBadge 
}) {
  const [showActions, setShowActions] = useState(false);
  const standard = STANDARDS[template.standard];
  const docType = Object.values(DOC_TYPES).find(dt => dt.id === template.docType);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="relative p-4 rounded-xl border cursor-pointer transition-all group"
      style={{ 
        background: isSelected ? 'rgba(94, 106, 210, 0.08)' : 'transparent',
        borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-subtle)'
      }}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div 
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'var(--brand-indigo)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
      )}

      {/* 自定义标记 */}
      {isCustom && (
        <div 
          className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium"
          style={{ 
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399'
          }}
        >
          自定义
        </div>
      )}

      {/* 操作按钮 */}
      <div 
        className={`absolute top-3 ${isCustom ? 'right-3' : 'right-10'} flex gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}
      >
        <button
          onClick={onClone}
          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
          title="克隆"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button
          onClick={onExport}
          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
          title="导出"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        {isCustom && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md transition-colors hover:bg-white/10"
            style={{ color: 'var(--brand-indigo)' }}
            title="编辑"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        {isCustom && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md transition-colors hover:bg-white/10"
            style={{ color: 'var(--error)' }}
            title="删除"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* 内容 */}
      <div className="pt-6">
        <h3 
          className="font-medium text-sm mb-1 line-clamp-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {template.name}
        </h3>
        <p 
          className="text-xs mb-3 line-clamp-2 h-8"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {template.description || docType?.description || '暂无描述'}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <span 
            className="px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ 
              background: standardBadge.bg,
              color: standardBadge.text
            }}
          >
            {standard?.shortName || standard?.name}
          </span>
          <span 
            className="px-2 py-0.5 rounded text-[10px]"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)'
            }}
          >
            {docType?.name || template.docType}
          </span>
        </div>
      </div>
    </div>
  );
}

// 模板列表项组件
function TemplateListItem({ 
  template, 
  isSelected, 
  isCustom, 
  onSelect, 
  onEdit, 
  onClone, 
  onDelete, 
  onExport,
  standardBadge 
}) {
  const standard = STANDARDS[template.standard];
  const docType = Object.values(DOC_TYPES).find(dt => dt.id === template.docType);

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/[0.02]"
      style={{ 
        background: isSelected ? 'rgba(94, 106, 210, 0.05)' : 'transparent',
        borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-subtle)'
      }}
    >
      {/* 选中状态 */}
      <div 
        className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
        style={{ 
          borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-standard)',
          background: isSelected ? 'var(--brand-indigo)' : 'transparent'
        }}
      >
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
      </div>

      {/* 自定义标记 */}
      {isCustom && (
        <span 
          className="px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
          style={{ 
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399'
          }}
        >
          自定义
        </span>
      )}

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span 
            className="font-medium text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {template.name}
          </span>
          <span 
            className="px-1.5 py-0.5 rounded text-[10px] flex-shrink-0"
            style={{ 
              background: standardBadge.bg,
              color: standardBadge.text
            }}
          >
            {standard?.shortName}
          </span>
        </div>
        <p 
          className="text-xs truncate mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {template.description || docType?.description}
        </p>
      </div>

      {/* 公文类型 */}
      <span 
        className="px-2 py-0.5 rounded text-xs flex-shrink-0"
        style={{ 
          background: 'rgba(255,255,255,0.03)',
          color: 'var(--text-tertiary)'
        }}
      >
        {docType?.name || template.docType}
      </span>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100">
        <button
          onClick={onClone}
          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
          title="克隆"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button
          onClick={onExport}
          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
          title="导出"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        {isCustom && (
          <>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md transition-colors hover:bg-white/10"
              style={{ color: 'var(--brand-indigo)' }}
              title="编辑"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md transition-colors hover:bg-white/10"
              style={{ color: 'var(--error)' }}
              title="删除"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TemplateManager;
