import { useState, useEffect } from 'react';
import { 
  templateManager, 
  STANDARDS, 
  DOC_TYPES, 
  getDocTypesByCategory 
} from '../constants/templateRegistry.js';
import TemplateImportExport from './TemplateImportExport.jsx';
import TemplateGenerator from './TemplateGenerator.jsx';

function TemplateManager({ isOpen, onClose, onSelectTemplate, currentTemplate }) {
  const [templates, setTemplates] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    description: '',
    docType: 'qsh_redhead',
    standard: 'qsh_0758_2019',
    styles: {}
  });

  useEffect(() => {
    setTemplates(templateManager.getAllTemplates());
  }, []);

  if (!isOpen) return null;

  const categories = getDocTypesByCategory();
  
  // 过滤模板
  const filteredTemplates = Object.values(templates).filter(template => {
    const matchesCategory = selectedCategory === 'all' || 
      (template.category === selectedCategory);
    const matchesStandard = selectedStandard === 'all' || 
      template.standard === selectedStandard;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStandard && matchesSearch;
  });

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleCreateCustom = () => {
    if (!customTemplate.name) return;
    
    const newTemplate = templateManager.createCustomTemplate({
      name: customTemplate.name,
      description: customTemplate.description,
      docType: customTemplate.docType,
      standard: customTemplate.standard,
      category: '自定义模板',
      styles: {}
    });
    
    if (newTemplate) {
      setTemplates(templateManager.getAllTemplates());
      setShowCustomForm(false);
      setCustomTemplate({
        name: '',
        description: '',
        docType: 'qsh_redhead',
        standard: 'qsh_0758_2019',
        styles: {}
      });
      onSelectTemplate(newTemplate);
      onClose();
    }
  };

  const handleDeleteCustom = (templateId) => {
    if (templateManager.deleteCustomTemplate(templateId)) {
      setTemplates(templateManager.getAllTemplates());
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div 
        className="w-[700px] max-h-[80vh] rounded-lg overflow-hidden flex flex-col"
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
              模板管理器
            </h2>
            <p 
              className="text-sm mt-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              选择或创建适合您需求的公文模板
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

        {/* Actions Bar */}
        <div 
          className="px-6 py-2 flex items-center gap-2"
          style={{ 
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ 
              background: 'rgba(94, 106, 210, 0.1)',
              color: 'var(--brand-indigo)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            生成 Word 模板
          </button>
          <button
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            导入/导出
          </button>
          <div className="flex-1"/>
          <span 
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {Object.values(templates).filter(t => t.isCustom).length} 个自定义模板
          </span>
        </div>

        {/* Filters */}
        <div 
          className="px-6 py-3 flex items-center gap-3"
          style={{ 
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板..."
              className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none"
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

          {/* Standard Filter */}
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="px-3 py-2 rounded-md text-sm outline-none"
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-md text-sm outline-none"
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
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-6">
          {showCustomForm ? (
            // Custom Template Form
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  模板名称 *
                </label>
                <input
                  type="text"
                  value={customTemplate.name}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：石化通知模板"
                  className="w-full px-3 py-2 rounded-md text-sm outline-none"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  描述
                </label>
                <input
                  type="text"
                  value={customTemplate.description}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简短描述模板用途..."
                  className="w-full px-3 py-2 rounded-md text-sm outline-none"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-standard)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    公文类型
                  </label>
                  <select
                    value={customTemplate.docType}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, docType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md text-sm outline-none"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-standard)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {Object.entries(categories).map(([category, types]) => (
                      <optgroup key={category} label={category}>
                        {types.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    规范标准
                  </label>
                  <select
                    value={customTemplate.standard}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, standard: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md text-sm outline-none"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-standard)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {Object.entries(STANDARDS).map(([id, standard]) => (
                      <option key={id} value={id}>{standard.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ 
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleCreateCustom}
                  disabled={!customTemplate.name}
                  className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ 
                    background: 'var(--brand-indigo)',
                    color: 'white'
                  }}
                >
                  创建模板
                </button>
              </div>
            </div>
          ) : (
            // Template Grid
            <div className="grid grid-cols-2 gap-4">
              {/* Create Custom Button */}
              <button
                onClick={() => setShowCustomForm(true)}
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors hover:bg-white/5"
                style={{ 
                  borderColor: 'var(--border-standard)',
                  color: 'var(--text-tertiary)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">创建自定义模板</span>
                <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  基于现有标准创建
                </span>
              </button>

              {/* Template Cards */}
              {filteredTemplates.map((template) => {
                const standard = STANDARDS[template.standard];
                const docType = Object.values(DOC_TYPES).find(dt => dt.id === template.docType);
                const isSelected = currentTemplate?.id === template.id;
                const isCustom = template.isCustom;

                return (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="relative p-4 rounded-lg border cursor-pointer transition-all hover:bg-white/5"
                    style={{ 
                      background: isSelected ? 'rgba(94, 106, 210, 0.1)' : 'transparent',
                      borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-subtle)'
                    }}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div 
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--brand-indigo)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                    )}

                    {/* Custom Badge */}
                    {isCustom && (
                      <div 
                        className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ 
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: 'var(--success)'
                        }}
                      >
                        自定义
                      </div>
                    )}

                    <h3 
                      className="font-medium text-sm mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {template.name}
                    </h3>
                    <p 
                      className="text-xs mb-3 line-clamp-2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {template.description || docType?.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px]"
                        style={{ 
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-muted)'
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
                        {docType?.name}
                      </span>
                    </div>

                    {/* Delete Button for Custom Templates */}
                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustom(template.id);
                        }}
                        className="absolute bottom-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--error)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
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
          <div className="flex items-center gap-4">
            <span 
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              共 {filteredTemplates.length} 个模板
            </span>
            <span 
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {Object.values(templates).filter(t => t.isCustom).length} 个自定义
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            关闭
          </button>
        </div>

        {/* Sub-components */}
        <TemplateImportExport
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
          onImport={() => setTemplates(templateManager.getAllTemplates())}
        />
        <TemplateGenerator
          isOpen={showGenerator}
          onClose={() => setShowGenerator(false)}
        />
      </div>
    </div>
  );
}

export default TemplateManager;
