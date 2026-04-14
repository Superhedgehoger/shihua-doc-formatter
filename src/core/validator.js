// 规范校验逻辑 - 支持多标准和模板

import { DOC_TYPES } from '../constants/templateRegistry.js';

// 获取校验规则，根据模板配置
function getValidationRules(template) {
  const docType = Object.values(DOC_TYPES).find(dt => dt.id === template?.docType);
  
  return [
    {
      id: "title_length",
      check: (doc) => !doc.title || doc.title.length <= 50,
      message: "主标题过长（超过50字），建议精简",
      level: "warning"
    },
    {
      id: "title_punctuation",
      check: (doc) => !doc.title || !/[。，、！？；]$/.test(doc.title),
      message: "主标题末尾不应有标点符号",
      level: "error"
    },
    {
      id: "title_empty",
      check: (doc) => doc.title && doc.title.trim().length > 0,
      message: "缺少主标题",
      level: "error"
    },
    {
      id: "level_continuity",
      check: (doc) => checkLevelContinuity(doc.body),
      message: "标题层级不连续（如从一级直接跳到三级）",
      level: "warning"
    },
    {
      id: "signoff_exists",
      check: (doc) => !docType?.hasSignature ? true : !!(doc.signoff && doc.signoff.organization && doc.signoff.date),
      message: `${docType?.name || '公文'}缺少发文机关署名或成文日期`,
      level: docType?.hasSignature ? "warning" : "info"
    },
    {
      id: "signoff_date_format",
      check: (doc) => !doc.signoff || !doc.signoff.date || /^\d{4}年\d{1,2}月\d{1,2}日$/.test(doc.signoff.date),
      message: "成文日期格式不规范，应为「XXXX年X月X日」",
      level: "error"
    },
    {
      id: "attachment_format",
      check: (doc) => !doc.attachments || doc.attachments.every(a => !a.endsWith("。") && !a.endsWith("，")),
      message: "附件名称末尾不应有标点符号",
      level: "error"
    },
    {
      id: "body_empty",
      check: (doc) => doc.body && doc.body.length > 0,
      message: "正文内容为空",
      level: "error"
    },
    {
      id: "salutation_required",
      check: (doc) => docType?.hasSalutation === false ? true : !!doc.salutation,
      message: `${docType?.name || '公文'}建议包含主送机关`,
      level: docType?.hasSalutation === true ? "warning" : "info"
    },
    {
      id: "file_number_required",
      check: (doc) => !docType?.hasFileNumber ? true : !!(doc.file_number || doc.metadata?.file_number),
      message: `${docType?.name || '公文'}应包含发文字号`,
      level: docType?.hasFileNumber ? "warning" : "info"
    },
    {
      id: "meeting_number_required",
      check: (doc) => !docType?.hasMeetingNumber ? true : !!doc.meeting_number,
      message: `${docType?.name || '公文'}应包含纪要编号`,
      level: docType?.hasMeetingNumber ? "warning" : "info"
    },
    {
      id: "approval_info_required",
      check: (doc) => !docType?.hasApprovalTable ? true : !!(doc.metadata?.dept && doc.metadata?.drafter),
      message: `${docType?.name || '公文'}应包含拟稿部门和人`,
      level: docType?.hasApprovalTable ? "warning" : "info"
    }
  ];
}

function checkLevelContinuity(body) {
  if (!body || body.length === 0) return true;
  
  const levels = body
    .filter(b => b.type && b.type.startsWith('h'))
    .map(b => parseInt(b.type.replace('h', ''), 10));
  
  if (levels.length === 0) return true;
  
  // 检查是否从1开始
  if (levels[0] > 1) return false;
  
  // 检查是否连续
  for (let i = 1; i < levels.length; i++) {
    const diff = levels[i] - levels[i - 1];
    if (diff > 1) return false;
  }
  
  return true;
}

export function validateDocument(docStructure, template) {
  const rules = getValidationRules(template);
  const results = [];
  
  for (const rule of rules) {
    const passed = rule.check(docStructure);
    if (!passed) {
      results.push({
        id: rule.id,
        message: rule.message,
        level: rule.level
      });
    }
  }
  
  return results;
}

export function hasBlockingErrors(validationResult) {
  return validationResult.some(r => r.level === 'error');
}
