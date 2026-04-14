/**
 * 文档结构分析器 - 本地规则解析（无需 AI API）
 * 基于正则表达式识别公文结构层级，支持多模板标准
 */

import { DOC_TYPES, templateManager } from '../constants/templateRegistry.js';

/**
 * 分析文档结构
 * @param {string} text - 输入文本
 * @param {string} docType - 公文类型 ID
 * @param {Object} metadata - 元数据
 * @param {Object} template - 模板配置（可选）
 * @returns {Object} 文档结构
 */
export function analyzeStructure(text, docType = 'qsh_redhead', metadata = {}, template = null) {
  if (!text || !text.trim()) {
    throw new Error('请输入文档内容');
  }

  // 获取模板配置
  const currentTemplate = template || templateManager.getTemplate(docType) || 
    Object.values(templateManager.getAllTemplates())[0];
  
  // 获取公文类型信息
  const docTypeInfo = Object.values(DOC_TYPES).find(dt => dt.id === currentTemplate?.docType) ||
    DOC_TYPES.REDHEAD;

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length === 0) {
    throw new Error('文档内容为空');
  }

  // 解析每一行
  const parsedLines = lines.map((line, index) => parseLine(line, index, docTypeInfo));
  
  // 提取标题（第一个非层级标记的行）
  const titleLine = parsedLines.find(p => p.type === 'text' && !isMetadataLine(p.text));
  const title = titleLine ? titleLine.text : '';
  
  // 提取主送机关
  const salutationLine = parsedLines.find(p => p.text.endsWith('：') && p.type === 'text');
  const salutation = salutationLine ? salutationLine.text : '';
  
  // 提取落款信息
  const signoff = extractSignoff(parsedLines);
  
  // 提取附件
  const attachments = extractAttachments(parsedLines);
  
  // 提取出席人员（会议纪要）
  const attendees = docTypeInfo.hasAttendees ? extractAttendees(parsedLines) : [];
  
  // 提取拟稿信息（工作表单）
  const approvalInfo = docTypeInfo.hasApprovalTable ? extractApprovalInfo(parsedLines) : {};
  
  // 构建正文结构
  const body = buildBodyStructure(parsedLines, title, salutation, signoff, attachments, docTypeInfo);
  
  return {
    doc_type: docTypeInfo.id,
    doc_type_name: docTypeInfo.name,
    template_id: currentTemplate?.id,
    standard: currentTemplate?.standard,
    title: title,
    title_confidence: 1.0,
    file_number: metadata.file_number || '',
    salutation: metadata.salutation || salutation,
    body: body,
    signoff: {
      organization: metadata.organization || signoff.organization,
      date: metadata.date || signoff.date
    },
    attachments: attachments,
    cc: metadata.cc ? metadata.cc.split(/[，,]/).map(s => s.trim()).filter(Boolean) : [],
    notes: '',
    meeting_number: metadata.meeting_number || extractMeetingNumber(parsedLines),
    attendees: attendees,
    drafter: metadata.drafter || approvalInfo.drafter || '',
    dept: metadata.dept || approvalInfo.dept || '',
    approver: metadata.approver || approvalInfo.approver || '',
    phone: metadata.phone || approvalInfo.phone || ''
  };
}

/**
 * 解析单行文本
 */
function parseLine(text, index, docTypeInfo) {
  // 使用模板特定的编号模式（如果有）
  const numberStyle = docTypeInfo.numberStyle || {};
  
  const patterns = [
    // 五级标题：①②③
    { type: 'h5', pattern: /^[①②③④⑤⑥⑦⑧⑨⑩][、.．\s]/ },
    // 四级标题：（1）（2）（3）
    { type: 'h4', pattern: /^[（(][一二三四五六七八九十1234567890]+[）)][、.．\s]/ },
    // 三级标题：1．2．3． 或 1. 2. 3.
    { type: 'h3', pattern: /^\d+[.．][、.．\s]/ },
    // 二级标题：（一）（二）（三）
    { type: 'h2', pattern: /^[（(][一二三四五六七八九十]+[）)][、.．\s]/ },
    // 一级标题：一、二、三、
    { type: 'h1', pattern: /^[一二三四五六七八九十]+[、.．\s]/ },
    // 附件说明
    { type: 'attachment', pattern: /^附件[：:]\s*/ },
    // 会议纪要编号：第XX期
    { type: 'meeting_number', pattern: /^第\d+期/ },
    // 出席/参会
    { type: 'attendee_header', pattern: /^(出席|参会|列席|特邀).*?[：:]/ },
  ];

  for (const { type, pattern } of patterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      const number = match ? match[0].replace(/[、.．\s]/g, '') : '';
      const content = text.replace(pattern, '').trim();
      return {
        id: `block_${String(index).padStart(3, '0')}`,
        type,
        number,
        text: content,
        confidence: 1.0
      };
    }
  }

  // 普通文本
  return {
    id: `block_${String(index).padStart(3, '0')}`,
    type: 'text',
    number: '',
    text: text,
    confidence: 1.0
  };
}

/**
 * 判断是否为元数据行
 */
function isMetadataLine(text) {
  const metadataPatterns = [
    /^附件[：:]/,
    /^抄送[：:]/,
    /^(送|发)[：:]/,
    /^拟稿[：:]/,
    /^签发[：:]/,
    /^第\d+期/,
    /^主题词[：:]/,
    /^关键词[：:]/,
  ];
  return metadataPatterns.some(p => p.test(text));
}

/**
 * 提取落款信息
 */
function extractSignoff(lines) {
  const result = { organization: '', date: '' };
  
  // 从后向前查找
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    
    // 日期格式：YYYY年M月D日 或 YYYY.MM.DD 等
    const datePattern = /(\d{4})[年.\-/](\d{1,2})[月.\-/](\d{1,2})[日]?/;
    if (datePattern.test(line.text) && !result.date) {
      const match = line.text.match(datePattern);
      result.date = `${match[1]}年${parseInt(match[2])}月${parseInt(match[3])}日`;
      continue;
    }
    
    // 机构名称（通常在日期上方）
    if (line.text.includes('公司') || line.text.includes('部') || line.text.includes('单位')) {
      if (!result.organization && line.type === 'text') {
        result.organization = line.text;
        continue;
      }
    }
  }
  
  return result;
}

/**
 * 提取附件列表
 */
function extractAttachments(lines) {
  const attachments = [];
  let inAttachmentSection = false;
  
  for (const line of lines) {
    // 检测附件标记
    if (line.type === 'attachment') {
      inAttachmentSection = true;
      if (line.text) {
        attachments.push(line.text);
      }
      continue;
    }
    
    // 续行（缩进或数字开头）
    if (inAttachmentSection) {
      if (/^\d+[.．]/.test(line.text) || /^\s/.test(line.original || line.text)) {
        const cleanText = line.text.replace(/^\d+[.．]\s*/, '').trim();
        if (cleanText) attachments.push(cleanText);
      } else {
        inAttachmentSection = false;
      }
    }
  }
  
  return attachments;
}

/**
 * 提取会议纪要编号
 */
function extractMeetingNumber(lines) {
  for (const line of lines) {
    if (line.type === 'meeting_number') {
      return line.number || '';
    }
    const match = line.text.match(/^第(\d+)期/);
    if (match) {
      return `第${match[1]}期`;
    }
  }
  return '';
}

/**
 * 提取出席人员名单（会议纪要）
 */
function extractAttendees(lines) {
  const attendees = [];
  let inAttendeeSection = false;
  
  for (const line of lines) {
    // 检测出席/参会标记
    if (line.type === 'attendee_header') {
      inAttendeeSection = true;
      const names = line.text.split(/[,，、\s]+/).filter(n => n && n.length > 1);
      attendees.push(...names);
      continue;
    }
    
    // 续行（人名列表）
    if (inAttendeeSection) {
      if (isMetadataLine(line.text) || line.type !== 'text') {
        inAttendeeSection = false;
        continue;
      }
      // 拆分人名
      const names = line.text.split(/[,，、\s]+/).filter(n => n && n.length > 1);
      if (names.length > 0 && names.length < 20) { // 避免误识别
        attendees.push(...names);
      }
    }
  }
  
  return [...new Set(attendees)]; // 去重
}

/**
 * 提取审批信息（工作表单）
 */
function extractApprovalInfo(lines) {
  const info = { drafter: '', dept: '', approver: '', phone: '' };
  
  for (const line of lines) {
    const text = line.text;
    
    // 拟稿人
    if (/拟稿[人]?[：:]\s*(.+)/.test(text)) {
      const match = text.match(/拟稿[人]?[：:]\s*(.+)/);
      if (match) info.drafter = match[1].trim();
    }
    // 拟稿部门
    else if (/拟稿部门[：:]\s*(.+)/.test(text) || /部门[：:]\s*(.+)/.test(text)) {
      const match = text.match(/(?:拟稿)?部门[：:]\s*(.+)/);
      if (match) info.dept = match[1].trim();
    }
    // 签发人
    else if (/签发[人]?[：:]\s*(.+)/.test(text)) {
      const match = text.match(/签发[人]?[：:]\s*(.+)/);
      if (match) info.approver = match[1].trim();
    }
    // 电话
    else if (/电话[：:]\s*(\d+)/.test(text)) {
      const match = text.match(/电话[：:]\s*(\d+)/);
      if (match) info.phone = match[1].trim();
    }
  }
  
  return info;
}

/**
 * 构建正文结构
 */
function buildBodyStructure(parsedLines, title, salutation, signoff, attachments, docTypeInfo) {
  const body = [];
  let inBody = false;
  
  for (const line of parsedLines) {
    // 跳过标题
    if (line.text === title) {
      inBody = true;
      continue;
    }
    
    // 跳过主送机关（如果不是会议纪要）
    if (line.text === salutation && docTypeInfo.hasSalutation !== false) {
      inBody = true;
      continue;
    }
    
    // 跳过落款相关内容
    if (line.text === signoff.organization || line.text.includes(signoff.date)) {
      continue;
    }
    
    // 跳过附件
    if (line.type === 'attachment' || attachments.some(a => line.text.includes(a))) {
      continue;
    }
    
    // 跳过会议纪要编号和出席人员
    if (line.type === 'meeting_number' || line.type === 'attendee_header') {
      continue;
    }
    
    // 构建正文块
    if (inBody && line.text) {
      let type = 'body';
      
      switch (line.type) {
        case 'h1': type = 'h1'; break;
        case 'h2': type = 'h2'; break;
        case 'h3': type = 'h3'; break;
        case 'h4': type = 'h4'; break;
        case 'h5': type = 'h5'; break;
        case 'text':
          // 检测主送机关格式
          if (line.text.endsWith('：') && docTypeInfo.hasSalutation !== false) {
            type = 'salutation';
          }
          break;
      }
      
      body.push({
        id: line.id,
        type,
        number: line.number,
        text: line.text,
        confidence: line.confidence
      });
    }
  }
  
  return body;
}
