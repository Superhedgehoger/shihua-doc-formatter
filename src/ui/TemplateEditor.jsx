import { useState, useEffect } from 'react';
import { STANDARDS, DOC_TYPES, STYLES } from '../constants/templateRegistry.js';

/**
 * 模板编辑器组件
 * 提供详细的模板配置编辑功能
 */
function TemplateEditor({ isOpen, onClose, template, onSave, mode = 'edit' }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    standard: 'qsh_0758_2019',
    docType: 'redhead',
    isCustom: true,
    margins: { top: 3.7, bottom: 3.5, left: 2.8, right: 2.6 },
    styles: {},
    features: {}
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  // 当模板变化时，初始化表单数据
  useEffect(() => {
    if (template) {
      setFormData({
        id: template.id || '',
        name: mode === 'clone' ? `${template.name} (副本)` : template.name || '',
        description: template.description || '',
        standard: template.standard || 'qsh_0758_2019',
        docType: template.docType || 'redhead',
        isCustom: true,
        margins: template.margins || { top: 3.7, bottom: 3.5, left: 2.8, right: 2.6 },
        styles: template.styles || JSON.parse(JSON.stringify(STYLES[template.standard] || STYLES.qsh_0758_2019)),
        features: template.features || {}
      });
    } else {
      // 新建模板，使用默认样式
      const defaultStandard = 'qsh_0758_2019';
      setFormData({
        id: '',
        name: '',
        description: '',
        standard: defaultStandard,
        docType: 'redhead',
        isCustom: true,
        margins: { ...STANDARDS[defaultStandard]?.defaultMargins },
        styles: JSON.parse(JSON.stringify(STYLES[defaultStandard])),
        features: {}
      });
    }
  }, [template, mode, isOpen]);

  // 当标准变化时，更新默认样式
  useEffect(() => {
    if (formData.standard && STYLES[formData.standard]) {
      setFormData(prev => ({
        ...prev,
        margins: { ...STANDARDS[formData.standard]?.defaultMargins },
        styles: JSON.parse(JSON.stringify(STYLES[formData.standard]))
      }));
    }
  }, [formData.standard]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入模板名称';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(formData);
  };

  const handleMarginChange = (key, value) => {
    const numValue = parseFloat(value);
    setFormData(prev => ({
      ...prev,
      margins: { ...prev.margins, [key]: isNaN(numValue) ? 0 : numValue }
    }));
  };

  const handleStyleChange = (element, property, value) => {
    setFormData(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [element]: {
          ...prev.styles[element],
          [property]: value
        }
      }
    }));
  };

  const handleStyleNumberChange = (element, property, value) => {
    const numValue = parseFloat(value);
    handleStyleChange(element, property, isNaN(numValue) ? 0 : numValue);
  };

  const handleFeatureChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
  };

  // 样式元素配置
  const styleElements = [
    { key: 'title', label: '主标题', icon: 'T' },
    { key: 'h1', label: '一级标题', icon: 'H1' },
    { key: 'h2', label: '二级标题', icon: 'H2' },
    { key: 'h3', label: '三级标题', icon: 'H3' },
    { key: 'h4', label: '四级标题', icon: 'H4' },
    { key: 'body', label: '正文', icon: '¶' },
    { key: 'salutation', label: '主送机关', icon: '→' },
    { key: 'signoffOrg', label: '落款机关', icon: '✎' },
    { key: 'signoffDate', label: '落款日期', icon: '⏎' },
    { key: 'attachment', label: '附件说明', icon: '⧉' },
    { key: 'colophon', label: '版记', icon: '═' },
    { key: 'pageNumber', label: '页码', icon: '#' }
  ];

  // 字体选项
  const fontOptions = [
    '方正小标宋简体', '黑体', '楷体_GB2312', '仿宋_GB2312', '宋体',
    '方正仿宋_GBK', '方正楷体_GBK', 'Times New Roman', 'Arial'
  ];

  // 对齐选项
  const alignOptions = [
    { value: 'left', label: '左对齐' },
    { value: 'center', label: '居中' },
    { value: 'right', label: '右对齐' },
    { value: 'justify', label: '两端对齐' }
  ];

  const getDocTypeName = (id) => {
    const docType = Object.values(DOC_TYPES).find(dt => dt.id === id);
    return docType?.name || id;
  };

  const getCategoryName = (id) => {
    const docType = Object.values(DOC_TYPES).find(dt => dt.id === id);
    return docType?.category || '';
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-[900px] max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
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
              style={{ background: 'var(--brand-indigo)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h2 
                className="text-lg font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {mode === 'create' ? '新建模板' : mode === 'clone' ? '克隆模板' : '编辑模板'}
              </h2>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {template?.name || '自定义公文格式配置'}
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

        {/* Tabs */}
        <div 
          className="flex gap-1 p-2 px-6"
          style={{ 
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          {[
            { id: 'basic', label: '基本信息', icon: 'ℹ' },
            { id: 'page', label: '页面设置', icon: '◱' },
            { id: 'styles', label: '样式配置', icon: '☰' },
            { id: 'features', label: '特性开关', icon: '☐' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ 
                background: activeTab === tab.id ? 'rgba(94, 106, 210, 0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--brand-indigo)' : 'var(--text-tertiary)'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 基本信息 */}
          {activeTab === 'basic' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  模板名称 <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：石化标准通知模板"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${errors.name ? 'var(--error)' : 'var(--border-standard)'}`,
                    color: 'var(--text-primary)'
                  }}
                />
                {errors.name && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--error)' }}>{errors.name}</p>
                )}
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简短描述模板的用途和特点..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all resize-none"
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
                    规范标准
                  </label>
                  <select
                    value={formData.standard}
                    onChange={(e) => setFormData(prev => ({ ...prev, standard: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
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
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {STANDARDS[formData.standard]?.description}
                  </p>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    公文类型
                  </label>
                  <select
                    value={formData.docType}
                    onChange={(e) => setFormData(prev => ({ ...prev, docType: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-standard)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {Object.entries(DOC_TYPES).map(([id, type]) => (
                      <option key={id} value={type.id}>
                        {type.category} - {type.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {getDocTypeName(formData.docType)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 页面设置 */}
          {activeTab === 'page' && (
            <div className="space-y-6">
              <div 
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <h3 
                  className="text-sm font-medium mb-4 flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'var(--brand-indigo)' }}>◱</span>
                  页边距设置（单位：厘米）
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'top', label: '上边距', icon: '↑' },
                    { key: 'bottom', label: '下边距', icon: '↓' },
                    { key: 'left', label: '左边距', icon: '←' },
                    { key: 'right', label: '右边距', icon: '→' }
                  ].map(({ key, label, icon }) => (
                    <div key={key}>
                      <label 
                        className="block text-xs font-medium mb-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {icon} {label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={formData.margins[key]}
                          onChange={(e) => handleMarginChange(key, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                          style={{ 
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-standard)',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>cm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 页面预览图 */}
              <div 
                className="p-6 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="relative">
                  {/* A4 纸张比例 210:297 */}
                  <div 
                    className="w-[140px] rounded shadow-lg"
                    style={{ 
                      aspectRatio: '210/297',
                      background: 'white',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {/* 边距可视化 */}
                    <div 
                      className="absolute rounded-sm"
                      style={{
                        top: `${(formData.margins.top / 29.7) * 100}%`,
                        left: `${(formData.margins.left / 21) * 100}%`,
                        right: `${(formData.margins.right / 21) * 100}%`,
                        bottom: `${(formData.margins.bottom / 29.7) * 100}%`,
                        background: 'rgba(94, 106, 210, 0.2)',
                        border: '1px dashed var(--brand-indigo)'
                      }}
                    />
                  </div>
                  <div 
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    A4 纸张边距预览
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 样式配置 */}
          {activeTab === 'styles' && (
            <div className="space-y-4">
              <div 
                className="flex items-center gap-2 p-3 rounded-lg text-xs"
                style={{ 
                  background: 'rgba(94, 106, 210, 0.08)',
                  color: 'var(--brand-indigo)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                点击左侧元素选择，在右侧编辑具体样式属性
              </div>

              <div className="grid grid-cols-[200px,1fr] gap-4">
                {/* 元素列表 */}
                <div 
                  className="rounded-xl overflow-hidden"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {styleElements.map(({ key, label, icon }) => {
                    const style = formData.styles[key];
                    return (
                      <div
                        key={key}
                        className="p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-white/5"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium"
                            style={{ 
                              background: 'rgba(255,255,255,0.05)',
                              color: 'var(--text-tertiary)'
                            }}
                          >
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {label}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                              {style?.size}pt · {style?.fontCn}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 样式编辑区 */}
                <div className="space-y-4">
                  {styleElements.map(({ key, label }) => {
                    const style = formData.styles[key];
                    if (!style) return null;

                    return (
                      <div 
                        key={key}
                        className="p-4 rounded-xl"
                        style={{ 
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <h4 
                          className="text-sm font-medium mb-3 flex items-center gap-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--brand-indigo)' }}
                          />
                          {label}
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {/* 中文字体 */}
                          <div>
                            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>中文字体</label>
                            <select
                              value={style.fontCn || ''}
                              onChange={(e) => handleStyleChange(key, 'fontCn', e.target.value)}
                              className="w-full px-2 py-1.5 rounded text-xs outline-none"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-standard)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              {fontOptions.map(font => (
                                <option key={font} value={font}>{font}</option>
                              ))}
                            </select>
                          </div>

                          {/* 英文字体 */}
                          <div>
                            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>英文字体</label>
                            <select
                              value={style.fontEn || ''}
                              onChange={(e) => handleStyleChange(key, 'fontEn', e.target.value)}
                              className="w-full px-2 py-1.5 rounded text-xs outline-none"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-standard)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Arial">Arial</option>
                              <option value="Courier New">Courier New</option>
                            </select>
                          </div>

                          {/* 字号 */}
                          <div>
                            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>字号 (pt)</label>
                            <input
                              type="number"
                              min="8"
                              max="72"
                              value={style.size || ''}
                              onChange={(e) => handleStyleNumberChange(key, 'size', e.target.value)}
                              className="w-full px-2 py-1.5 rounded text-xs outline-none"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-standard)',
                                color: 'var(--text-primary)'
                              }}
                            />
                          </div>

                          {/* 对齐方式 */}
                          <div>
                            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>对齐</label>
                            <select
                              value={style.align || 'left'}
                              onChange={(e) => handleStyleChange(key, 'align', e.target.value)}
                              className="w-full px-2 py-1.5 rounded text-xs outline-none"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-standard)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              {alignOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* 行高 */}
                          <div>
                            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>行高 (pt)</label>
                            <input
                              type="number"
                              min="12"
                              max="72"
                              value={style.lineHeight || ''}
                              onChange={(e) => handleStyleNumberChange(key, 'lineHeight', e.target.value)}
                              className="w-full px-2 py-1.5 rounded text-xs outline-none"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-standard)',
                                color: 'var(--text-primary)'
                              }}
                            />
                          </div>

                          {/* 加粗 */}
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`${key}-bold`}
                              checked={style.bold || false}
                              onChange={(e) => handleStyleChange(key, 'bold', e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                            <label 
                              htmlFor={`${key}-bold`}
                              className="text-xs cursor-pointer"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              加粗
                            </label>
                          </div>

                          {/* 首行缩进 */}
                          {style.indent !== undefined && (
                            <div>
                              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>首行缩进 (字符)</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={style.indent || ''}
                                onChange={(e) => handleStyleNumberChange(key, 'indent', e.target.value)}
                                className="w-full px-2 py-1.5 rounded text-xs outline-none"
                                style={{ 
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid var(--border-standard)',
                                  color: 'var(--text-primary)'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 特性开关 */}
          {activeTab === 'features' && (
            <div className="space-y-6 max-w-lg">
              <div 
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <h3 
                  className="text-sm font-medium mb-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  公文元素特性
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'hasRedLine', label: '红头分隔线', desc: '发文机关标识下方的红色分隔线' },
                    { key: 'hasFileNumber', label: '发文字号', desc: '文件编号（如：石油化字〔2024〕1号）' },
                    { key: 'hasDistribution', label: '印发说明', desc: '版记中的印发单位和日期' },
                    { key: 'hasSignature', label: '落款署名', desc: '发文机关署名和成文日期' },
                    { key: 'hasSeal', label: '印章位置', desc: '落款处的印章标注' },
                    { key: 'hasMeetingNumber', label: '会议纪要编号', desc: '会议纪要的特定编号格式' },
                    { key: 'hasApprovalTable', label: '审批表格', desc: '工作表单中的审批栏' }
                  ].map(({ key, label, desc }) => (
                    <label 
                      key={key}
                      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={formData.features[key] || false}
                        onChange={(e) => handleFeatureChange(key, e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 预览提示 */}
              <div 
                className="p-4 rounded-xl flex items-start gap-3"
                style={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>提示</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    保存模板后，在文档解析时会根据这些特性自动识别和处理相应的公文元素。
                    不同公文类型可能需要不同的特性组合。
                  </p>
                </div>
              </div>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(prev => {
                const tabs = ['basic', 'page', 'styles', 'features'];
                const idx = tabs.indexOf(prev);
                return tabs[Math.max(0, idx - 1)];
              })}
              disabled={activeTab === 'basic'}
              className="px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-tertiary)' }}
            >
              上一步
            </button>
            <button
              onClick={() => setActiveTab(prev => {
                const tabs = ['basic', 'page', 'styles', 'features'];
                const idx = tabs.indexOf(prev);
                return tabs[Math.min(tabs.length - 1, idx + 1)];
              })}
              disabled={activeTab === 'features'}
              className="px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-tertiary)' }}
            >
              下一步
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ 
                background: 'var(--brand-indigo)',
                color: 'white'
              }}
            >
              {mode === 'create' ? '创建模板' : mode === 'clone' ? '克隆模板' : '保存修改'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
