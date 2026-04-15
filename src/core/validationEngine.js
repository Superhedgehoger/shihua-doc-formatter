/**
 * 文档校验引擎
 * 实现文档结构校验规则
 */

// 校验规则定义
const VALIDATION_RULES = [
  {
    id: 'title_punctuation',
    name: '标题标点检查',
    check: (doc) => {
      if (!doc.title) return { passed: true };
      const hasTrailingPunctuation = /[。，、！？；：]$/.test(doc.title);
      return {
        passed: !hasTrailingPunctuation,
        message: hasTrailingPunctuation ? '标题末尾不应有标点符号' : null,
        suggestion: doc.title.replace(/[。，、！？；：]$/, '')
      };
    },
    level: 'error',
    category: '格式规范'
  },
  {
    id: 'title_length',
    name: '标题长度检查',
    check: (doc) => {
      if (!doc.title) return { passed: true };
      const length = doc.title.length;
      return {
        passed: length <= 50,
        message: length > 50 ? `标题过长（${length}字符），建议控制在50字以内` : null
      };
    },
    level: 'warning',
    category: '格式规范'
  },
  {
    id: 'level_continuity',
    name: '标题层级连续性',
    check: (doc) => {
      if (!doc.body || doc.body.length === 0) return { passed: true };
      
      const headingLevels = doc.body
        .filter(b => b.type.startsWith('h'))
        .map(b => parseInt(b.type.replace('h', '')));
      
      if (headingLevels.length === 0) return { passed: true };
      
      const issues = [];
      let prevLevel = 0;
      
      for (let i = 0; i < headingLevels.length; i++) {
        const level = headingLevels[i];
        
        // 检查层级跳跃（例如从 h1 直接跳到 h3）
        if (level > prevLevel + 1) {
          issues.push({
            position: i,
            from: `h${prevLevel || '无'}`,
            to: `h${level}`,
            message: `标题层级不连续：从 ${prevLevel ? 'h' + prevLevel : '正文'} 跳到 h${level}`
          });
        }
        
        prevLevel = level;
      }
      
      return {
        passed: issues.length === 0,
        message: issues.length > 0 ? issues[0].message : null,
        details: issues
      };
    },
    level: 'warning',
    category: '结构规范'
  },
  {
    id: 'empty_sections',
    name: '空段落检查',
    check: (doc) => {
      if (!doc.body) return { passed: true };
      
      const emptyBlocks = doc.body.filter(b => !b.text || b.text.trim() === '');
      
      return {
        passed: emptyBlocks.length === 0,
        message: emptyBlocks.length > 0 ? `发现 ${emptyBlocks.length} 个空段落` : null,
        count: emptyBlocks.length
      };
    },
    level: 'info',
    category: '内容检查'
  },
  {
    id: 'attachment_format',
    name: '附件格式检查',
    check: (doc) => {
      if (!doc.attachments || doc.attachments.length === 0) return { passed: true };
      
      const issues = [];
      
      for (const att of doc.attachments) {
        // 检查附件名称是否以"附件"开头
        if (!att.name.startsWith('附件')) {
          issues.push({
            name: att.name,
            message: '附件名称应以"附件"开头'
          });
        }
      }
      
      return {
        passed: issues.length === 0,
        message: issues.length > 0 ? issues[0].message : null,
        details: issues
      };
    },
    level: 'warning',
    category: '格式规范'
  },
  {
    id: 'file_number_format',
    name: '发文字号格式',
    check: (doc) => {
      if (!doc.metadata?.file_number) return { passed: true };
      
      const fileNumber = doc.metadata.file_number;
      // 匹配：XXX〔YYYY〕NN号 或 XXX[YYYY]NN号
      const validFormat = /^.+[\[〔]\d{4}[\]〕]\d+号$/.test(fileNumber);
      
      return {
        passed: validFormat,
        message: validFormat ? null : '发文字号格式应为：单位〔年份〕序号号',
        suggestion: validFormat ? null : '例如：销售工单鲁办〔2024〕1号'
      };
    },
    level: 'error',
    category: '格式规范'
  },
  {
    id: 'date_format',
    name: '日期格式检查',
    check: (doc) => {
      if (!doc.metadata?.date) return { passed: true };
      
      const date = doc.metadata.date;
      // 匹配：YYYY年M月D日 或 YYYY.MM.DD 或 YYYY-MM-DD
      const validFormat = /^\d{4}[年.\-]\d{1,2}[月.\-]\d{1,2}[日]?$/.test(date);
      
      return {
        passed: validFormat,
        message: validFormat ? null : '日期格式不正确',
        suggestion: validFormat ? null : '例如：2024年1月15日 或 2024.01.15'
      };
    },
    level: 'error',
    category: '格式规范'
  },
  {
    id: 'heading_numbering',
    name: '标题编号一致性',
    check: (doc) => {
      if (!doc.body) return { passed: true };
      
      const headings = doc.body.filter(b => b.type.startsWith('h'));
      const issues = [];
      
      for (const heading of headings) {
        const text = heading.text || '';
        const hasNumber = /^[一二三四五六七八九十百千万]+[、.．]/.test(text) ||
                         /^[（(][一二三四五六七八九十]+[）)]/.test(text) ||
                         /^\d+[.．]/.test(text) ||
                         /^[（(]\d+[）)]/.test(text);
        
        // 一级标题应该有编号
        if (heading.type === 'h1' && !hasNumber) {
          issues.push({
            id: heading.id,
            message: '一级标题建议添加编号（如：一、）'
          });
        }
      }
      
      return {
        passed: issues.length === 0,
        message: issues.length > 0 ? issues[0].message : null,
        count: issues.length
      };
    },
    level: 'info',
    category: '结构规范'
  },
  {
    id: 'signature_completeness',
    name: '落款完整性',
    check: (doc) => {
      if (!doc.metadata?.hasSignature) return { passed: true };
      
      const hasOrg = !!doc.metadata.organization;
      const hasDate = !!doc.metadata.date;
      
      if (!hasOrg && !hasDate) {
        return {
          passed: false,
          message: '落款缺少单位和日期'
        };
      } else if (!hasOrg) {
        return {
          passed: false,
          message: '落款缺少单位'
        };
      } else if (!hasDate) {
        return {
          passed: false,
          message: '落款缺少日期'
        };
      }
      
      return { passed: true };
    },
    level: 'error',
    category: '内容完整性'
  },
  {
    id: 'content_length',
    name: '正文长度检查',
    check: (doc) => {
      if (!doc.body) return { passed: true };
      
      const bodyText = doc.body
        .filter(b => b.type === 'body')
        .map(b => b.text)
        .join('');
      
      const charCount = bodyText.length;
      
      return {
        passed: charCount >= 100,
        message: charCount < 100 ? `正文内容较短（${charCount}字），建议补充详细信息` : null
      };
    },
    level: 'info',
    category: '内容检查'
  }
];

/**
 * 执行文档校验
 * @param {Object} doc - 文档结构对象
 * @returns {Object} 校验结果
 */
export function validateDocument(doc) {
  const results = [];
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  
  for (const rule of VALIDATION_RULES) {
    try {
      const result = rule.check(doc);
      
      if (!result.passed) {
        switch (rule.level) {
          case 'error': errorCount++; break;
          case 'warning': warningCount++; break;
          case 'info': infoCount++; break;
        }
      }
      
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        level: rule.level,
        category: rule.category,
        passed: result.passed,
        message: result.message,
        suggestion: result.suggestion,
        details: result.details,
        count: result.count
      });
    } catch (e) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        level: 'error',
        category: rule.category,
        passed: false,
        message: `校验规则执行失败: ${e.message}`
      });
      errorCount++;
    }
  }
  
  // 按严重程度和类别排序
  const levelOrder = { error: 0, warning: 1, info: 2 };
  results.sort((a, b) => {
    if (levelOrder[a.level] !== levelOrder[b.level]) {
      return levelOrder[a.level] - levelOrder[b.level];
    }
    return a.category.localeCompare(b.category);
  });
  
  return {
    valid: errorCount === 0,
    errorCount,
    warningCount,
    infoCount,
    totalIssues: errorCount + warningCount + infoCount,
    results,
    timestamp: new Date().toISOString()
  };
}

/**
 * 获取单个校验规则
 * @param {string} ruleId - 规则ID
 * @returns {Object|null}
 */
export function getValidationRule(ruleId) {
  return VALIDATION_RULES.find(r => r.id === ruleId) || null;
}

/**
 * 获取所有校验规则
 * @returns {Array}
 */
export function getAllValidationRules() {
  return VALIDATION_RULES.map(r => ({
    id: r.id,
    name: r.name,
    level: r.level,
    category: r.category
  }));
}

/**
 * 按类别获取校验规则
 * @returns {Object}
 */
export function getValidationRulesByCategory() {
  const categories = {};
  
  for (const rule of VALIDATION_RULES) {
    if (!categories[rule.category]) {
      categories[rule.category] = [];
    }
    categories[rule.category].push({
      id: rule.id,
      name: rule.name,
      level: rule.level
    });
  }
  
  return categories;
}

/**
 * 快速检查文档是否有严重错误
 * @param {Object} doc - 文档结构对象
 * @returns {boolean}
 */
export function hasCriticalErrors(doc) {
  const validation = validateDocument(doc);
  return validation.errorCount > 0;
}

/**
 * 自动修复一些简单问题
 * @param {Object} doc - 文档结构对象
 * @returns {Object} 修复后的文档
 */
export function autoFixDocument(doc) {
  const fixed = { ...doc };
  const fixes = [];
  
  // 修复标题末尾标点
  if (fixed.title) {
    const originalTitle = fixed.title;
    fixed.title = originalTitle.replace(/[。，、！？；：]$/, '');
    if (fixed.title !== originalTitle) {
      fixes.push({
        rule: 'title_punctuation',
        original: originalTitle,
        fixed: fixed.title
      });
    }
  }
  
  // 修复日期格式
  if (fixed.metadata?.date) {
    const originalDate = fixed.metadata.date;
    // 统一转换为 YYYY年M月D日 格式
    const match = originalDate.match(/(\d{4})[\.\-\/年](\d{1,2})[\.\-\/月](\d{1,2})/);
    if (match) {
      fixed.metadata.date = `${match[1]}年${parseInt(match[2])}月${parseInt(match[3])}日`;
      if (fixed.metadata.date !== originalDate) {
        fixes.push({
          rule: 'date_format',
          original: originalDate,
          fixed: fixed.metadata.date
        });
      }
    }
  }
  
  return {
    document: fixed,
    fixes,
    fixCount: fixes.length
  };
}

export default {
  validateDocument,
  getValidationRule,
  getAllValidationRules,
  getValidationRulesByCategory,
  hasCriticalErrors,
  autoFixDocument
};
