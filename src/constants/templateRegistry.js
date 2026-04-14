/**
 * 公文模板注册表
 * 支持 Q/SH 0758-2019（石化标准）和 GB/T 9704-2012（国家标准）
 * 以及用户自定义模板
 */

// ==================== 标准定义 ====================
export const STANDARDS = {
  // 中国石化标准
  QSH_0758_2019: {
    id: 'qsh_0758_2019',
    name: 'Q/SH 0758-2019',
    fullName: '中国石化公文处理规范',
    description: '中国石化企业标准',
    defaultMargins: {
      top: 3.7,      // 上边距 cm
      bottom: 3.5,   // 下边距 cm
      left: 2.8,     // 左边距 cm
      right: 2.6     // 右边距 cm
    }
  },
  // 国家标准
  GB_T_9704_2012: {
    id: 'gb_t_9704_2012',
    name: 'GB/T 9704-2012',
    fullName: '党政机关公文格式',
    description: '国家推荐性标准',
    defaultMargins: {
      top: 3.7,
      bottom: 3.5,
      left: 2.8,
      right: 2.6
    }
  }
};

// ==================== 公文类型定义 ====================
export const DOC_TYPES = {
  // 通用类型
  REDHEAD: {
    id: 'redhead',
    name: '红头文件',
    category: '正式公文',
    description: '带发文机关标识的正式文件',
    hasFileNumber: true,
    hasRedLine: true,
    hasSignature: true,
    hasSeal: true,
    hasDistribution: true,
    defaultStandard: 'qsh_0758_2019'
  },
  NOTICE: {
    id: 'notice',
    name: '通知',
    category: '正式公文',
    description: '发布法规、规章，转发上级文件',
    hasFileNumber: true,
    hasRedLine: true,
    hasSignature: true,
    hasSeal: true,
    defaultStandard: 'qsh_0758_2019'
  },
  REPORT: {
    id: 'report',
    name: '报告',
    category: '正式公文',
    description: '向上级汇报工作、反映情况',
    hasFileNumber: true,
    hasRedLine: true,
    hasSignature: true,
    hasSeal: true,
    defaultStandard: 'qsh_0758_2019'
  },
  REQUEST: {
    id: 'request',
    name: '请示',
    category: '正式公文',
    description: '向上级请求指示或批准',
    hasFileNumber: true,
    hasRedLine: true,
    hasSignature: true,
    hasSeal: true,
    defaultStandard: 'qsh_0758_2019'
  },
  LETTER: {
    id: 'letter',
    name: '函',
    category: '正式公文',
    description: '不相隶属机关之间商洽工作',
    hasFileNumber: true,
    hasRedLine: false,
    hasSignature: true,
    hasSeal: true,
    defaultStandard: 'gb_t_9704_2012'
  },
  MINUTES: {
    id: 'minutes',
    name: '会议纪要',
    category: '会议文书',
    description: '记载会议主要情况和议定事项',
    hasFileNumber: false,
    hasRedLine: false,
    hasSignature: false,
    hasSeal: false,
    hasMeetingNumber: true,
    defaultStandard: 'qsh_0758_2019'
  },
  // 内部文书
  FORM: {
    id: 'form',
    name: '工作表单',
    category: '内部文书',
    description: '内部审批流转表单',
    hasFileNumber: false,
    hasRedLine: false,
    hasSignature: true,
    hasSeal: false,
    hasApprovalTable: true,
    defaultStandard: 'qsh_0758_2019'
  },
  INTERNAL_NOTICE: {
    id: 'internal_notice',
    name: '内部通知',
    category: '内部文书',
    description: '单位内部发布事项',
    hasFileNumber: false,
    hasRedLine: false,
    hasSignature: true,
    hasSeal: false,
    defaultStandard: 'qsh_0758_2019'
  },
  BULLETIN: {
    id: 'bulletin',
    name: '简报',
    category: '内部文书',
    description: '反映工作情况，交流经验',
    hasFileNumber: false,
    hasRedLine: false,
    hasSignature: false,
    hasSeal: false,
    defaultStandard: 'qsh_0758_2019'
  },
  // 其他类型
  DECISION: {
    id: 'decision',
    name: '决定',
    category: '正式公文',
    description: '对重要事项作出决策',
    hasFileNumber: true,
    hasRedLine: true,
    hasSignature: true,
    hasSeal: true,
    defaultStandard: 'gb_t_9704_2012'
  },
  OPINION: {
    id: 'opinion',
    name: '意见',
    category: '正式公文',
    description: '对重要问题提出见解',
    hasFileNumber: true,
    hasRedLine: true,
    hasSignature: true,
    hasSeal: true,
    defaultStandard: 'gb_t_9704_2012'
  },
  PLAN: {
    id: 'plan',
    name: '计划',
    category: '工作文书',
    description: '工作部署和安排',
    hasFileNumber: false,
    hasRedLine: false,
    hasSignature: true,
    hasSeal: false,
    defaultStandard: 'qsh_0758_2019'
  },
  SUMMARY: {
    id: 'summary',
    name: '总结',
    category: '工作文书',
    description: '工作总结和回顾',
    hasFileNumber: false,
    hasRedLine: false,
    hasSignature: true,
    hasSeal: false,
    defaultStandard: 'qsh_0758_2019'
  }
};

// ==================== 样式定义 ====================
export const STYLES = {
  // Q/SH 0758-2019 样式
  qsh_0758_2019: {
    title: {
      name: 'GW_主标题',
      fontCn: '方正小标宋简体',
      fontEn: 'Times New Roman',
      size: 22,      // 二号
      bold: false,
      align: 'center',
      lineHeight: 28
    },
    h1: {
      name: 'GW_一级标题',
      fontCn: '黑体',
      fontEn: 'Times New Roman',
      size: 16,      // 三号
      bold: false,
      align: 'left',
      indent: 2,     // 首行缩进2字符
      lineHeight: 28
    },
    h2: {
      name: 'GW_二级标题',
      fontCn: '楷体_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    h3: {
      name: 'GW_三级标题',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    h4: {
      name: 'GW_四级标题',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    body: {
      name: 'GW_正文',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'justify',
      indent: 2,
      lineHeight: 28
    },
    salutation: {
      name: 'GW_主送机关',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 0,
      lineHeight: 28
    },
    signoffOrg: {
      name: 'GW_落款机关',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'right',
      indent: 0,
      rightIndent: 2,  // 右缩进2字符
      lineHeight: 28
    },
    signoffDate: {
      name: 'GW_落款日期',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'center',
      indent: 0,
      lineHeight: 28
    },
    attachment: {
      name: 'GW_附件说明',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    colophon: {
      name: 'GW_版记',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 14,      // 四号
      bold: false,
      align: 'left',
      indent: 0,
      leftIndent: 0.5,
      rightIndent: 0.5,
      lineHeight: 22
    },
    pageNumber: {
      name: 'GW_页码',
      fontCn: '宋体',
      fontEn: 'Times New Roman',
      size: 14,
      bold: false,
      align: 'center',
      format: '— {page} —'
    }
  },

  // GB/T 9704-2012 样式
  gb_t_9704_2012: {
    title: {
      name: 'GB_主标题',
      fontCn: '方正小标宋简体',
      fontEn: 'Times New Roman',
      size: 22,
      bold: false,
      align: 'center',
      lineHeight: 28
    },
    h1: {
      name: 'GB_一级标题',
      fontCn: '黑体',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    h2: {
      name: 'GB_二级标题',
      fontCn: '楷体_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    h3: {
      name: 'GB_三级标题',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    h4: {
      name: 'GB_四级标题',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    body: {
      name: 'GB_正文',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'justify',
      indent: 2,
      lineHeight: 28
    },
    salutation: {
      name: 'GB_主送机关',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 0,
      lineHeight: 28
    },
    signoffOrg: {
      name: 'GB_落款机关',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'right',
      indent: 0,
      rightIndent: 2,
      lineHeight: 28
    },
    signoffDate: {
      name: 'GB_落款日期',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'center',
      indent: 0,
      lineHeight: 28
    },
    attachment: {
      name: 'GB_附件说明',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 16,
      bold: false,
      align: 'left',
      indent: 2,
      lineHeight: 28
    },
    colophon: {
      name: 'GB_版记',
      fontCn: '仿宋_GB2312',
      fontEn: 'Times New Roman',
      size: 14,
      bold: false,
      align: 'left',
      indent: 0,
      leftIndent: 0.5,
      rightIndent: 0.5,
      lineHeight: 22
    },
    pageNumber: {
      name: 'GB_页码',
      fontCn: '宋体',
      fontEn: 'Times New Roman',
      size: 14,
      bold: false,
      align: 'center',
      format: '— {page} —'
    }
  }
};

// ==================== 模板类 ====================
export class Template {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.standard = config.standard;  // 'qsh_0758_2019' | 'gb_t_9704_2012'
    this.docType = config.docType;    // 公文类型ID
    this.description = config.description || '';
    this.margins = config.margins || STANDARDS[config.standard]?.defaultMargins;
    this.styles = config.styles || STYLES[config.standard];
    this.features = config.features || {};
    this.isCustom = config.isCustom || false;
    this.createdAt = config.createdAt || new Date().toISOString();
    this.updatedAt = config.updatedAt || new Date().toISOString();
  }

  // 获取样式配置
  getStyle(elementType) {
    return this.styles[elementType] || this.styles.body;
  }

  // 获取边距（转换为twips）
  getMarginsInTwips() {
    const TWIPS_PER_CM = 567;
    return {
      top: Math.round(this.margins.top * TWIPS_PER_CM),
      bottom: Math.round(this.margins.bottom * TWIPS_PER_CM),
      left: Math.round(this.margins.left * TWIPS_PER_CM),
      right: Math.round(this.margins.right * TWIPS_PER_CM)
    };
  }

  // 导出为JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      standard: this.standard,
      docType: this.docType,
      description: this.description,
      margins: this.margins,
      styles: this.styles,
      features: this.features,
      isCustom: this.isCustom,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// ==================== 内置模板 ====================
export const BUILTIN_TEMPLATES = [
  // Q/SH 0758-2019 模板
  new Template({
    id: 'qsh_redhead',
    name: '石化红头文件',
    standard: 'qsh_0758_2019',
    docType: 'redhead',
    description: '中国石化标准红头文件',
    features: {
      hasRedLine: true,
      hasFileNumber: true,
      hasDistribution: true
    }
  }),
  new Template({
    id: 'qsh_notice',
    name: '石化通知',
    standard: 'qsh_0758_2019',
    docType: 'notice',
    description: '中国石化通知格式'
  }),
  new Template({
    id: 'qsh_report',
    name: '石化报告',
    standard: 'qsh_0758_2019',
    docType: 'report',
    description: '中国石化报告格式'
  }),
  new Template({
    id: 'qsh_request',
    name: '石化请示',
    standard: 'qsh_0758_2019',
    docType: 'request',
    description: '中国石化请示格式'
  }),
  new Template({
    id: 'qsh_minutes',
    name: '石化会议纪要',
    standard: 'qsh_0758_2019',
    docType: 'minutes',
    description: '中国石化会议纪要格式',
    features: {
      hasMeetingNumber: true
    }
  }),
  new Template({
    id: 'qsh_form',
    name: '石化工作表单',
    standard: 'qsh_0758_2019',
    docType: 'form',
    description: '中国石化工作表单格式',
    features: {
      hasApprovalTable: true
    }
  }),

  // GB/T 9704-2012 模板
  new Template({
    id: 'gb_redhead',
    name: '国标红头文件',
    standard: 'gb_t_9704_2012',
    docType: 'redhead',
    description: '国家标准红头文件格式',
    features: {
      hasRedLine: true,
      hasFileNumber: true,
      hasDistribution: true
    }
  }),
  new Template({
    id: 'gb_notice',
    name: '国标通知',
    standard: 'gb_t_9704_2012',
    docType: 'notice',
    description: '国家标准通知格式'
  }),
  new Template({
    id: 'gb_report',
    name: '国标报告',
    standard: 'gb_t_9704_2012',
    docType: 'report',
    description: '国家标准报告格式'
  }),
  new Template({
    id: 'gb_request',
    name: '国标请示',
    standard: 'gb_t_9704_2012',
    docType: 'request',
    description: '国家标准请示格式'
  }),
  new Template({
    id: 'gb_letter',
    name: '国标函',
    standard: 'gb_t_9704_2012',
    docType: 'letter',
    description: '国家标准函格式'
  }),
  new Template({
    id: 'gb_decision',
    name: '国标决定',
    standard: 'gb_t_9704_2012',
    docType: 'decision',
    description: '国家标准决定格式'
  }),
  new Template({
    id: 'gb_opinion',
    name: '国标意见',
    standard: 'gb_t_9704_2012',
    docType: 'opinion',
    description: '国家标准意见格式'
  })
];

// ==================== 模板管理器 ====================
class TemplateManager {
  constructor() {
    this.templates = new Map();
    this.customTemplates = new Map();
    this.loadBuiltinTemplates();
    this.loadCustomTemplates();
  }

  // 加载内置模板
  loadBuiltinTemplates() {
    BUILTIN_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // 从 localStorage 加载自定义模板
  loadCustomTemplates() {
    try {
      const saved = localStorage.getItem('customTemplates');
      if (saved) {
        const customList = JSON.parse(saved);
        customList.forEach(config => {
          const template = new Template({ ...config, isCustom: true });
          this.customTemplates.set(template.id, template);
          this.templates.set(template.id, template);
        });
      }
    } catch (e) {
      console.error('加载自定义模板失败:', e);
    }
  }

  // 保存自定义模板到 localStorage
  saveCustomTemplates() {
    try {
      const customList = Array.from(this.customTemplates.values()).map(t => t.toJSON());
      localStorage.setItem('customTemplates', JSON.stringify(customList));
    } catch (e) {
      console.error('保存自定义模板失败:', e);
    }
  }

  // 获取所有模板
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  // 按标准获取模板
  getTemplatesByStandard(standard) {
    return this.getAllTemplates().filter(t => t.standard === standard);
  }

  // 按类型获取模板
  getTemplatesByType(docType) {
    return this.getAllTemplates().filter(t => t.docType === docType);
  }

  // 获取单个模板
  getTemplate(id) {
    return this.templates.get(id);
  }

  // 添加自定义模板
  addCustomTemplate(config) {
    const template = new Template({
      ...config,
      id: `custom_${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    });
    this.customTemplates.set(template.id, template);
    this.templates.set(template.id, template);
    this.saveCustomTemplates();
    return template;
  }

  // 更新自定义模板
  updateCustomTemplate(id, updates) {
    const template = this.customTemplates.get(id);
    if (!template) return null;
    
    Object.assign(template, updates, { updatedAt: new Date().toISOString() });
    this.saveCustomTemplates();
    return template;
  }

  // 删除自定义模板
  deleteCustomTemplate(id) {
    if (this.customTemplates.has(id)) {
      this.customTemplates.delete(id);
      this.templates.delete(id);
      this.saveCustomTemplates();
      return true;
    }
    return false;
  }

  // 克隆模板（用于基于现有模板创建新模板）
  cloneTemplate(sourceId, newName) {
    const source = this.templates.get(sourceId);
    if (!source) return null;

    return this.addCustomTemplate({
      name: newName,
      standard: source.standard,
      docType: source.docType,
      description: `${source.description}（克隆）`,
      margins: { ...source.margins },
      styles: JSON.parse(JSON.stringify(source.styles)),
      features: { ...source.features }
    });
  }

  // 导出模板为JSON文件
  exportTemplate(id) {
    const template = this.templates.get(id);
    if (!template) return null;
    return JSON.stringify(template.toJSON(), null, 2);
  }

  // 从JSON导入模板
  importTemplate(jsonString) {
    try {
      const config = JSON.parse(jsonString);
      return this.addCustomTemplate(config);
    } catch (e) {
      console.error('导入模板失败:', e);
      return null;
    }
  }
}

// 导出单例
export const templateManager = new TemplateManager();

// 获取分类后的公文类型
export function getDocTypesByCategory() {
  const categories = {};
  Object.values(DOC_TYPES).forEach(docType => {
    if (!categories[docType.category]) {
      categories[docType.category] = [];
    }
    categories[docType.category].push(docType);
  });
  return categories;
}

// 获取文档类型的默认模板
export function getDefaultTemplateForDocType(docTypeId) {
  const docType = DOC_TYPES[docTypeId.toUpperCase()];
  if (!docType) return null;
  
  return BUILTIN_TEMPLATES.find(t => 
    t.docType === docType.id && 
    t.standard === docType.defaultStandard
  );
}
