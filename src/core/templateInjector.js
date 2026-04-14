import PizZip from 'pizzip';
import { loadTemplate } from '../constants/templates.js';
import { templateManager } from '../constants/templateRegistry.js';

// ── 工具函数：将文本转义为 XML 安全字符串 ──
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── 核心：将一个 BodyBlock 转为 Word XML 段落字符串 ──
function blockToXml(block, template) {
  // 从模板获取样式名称
  const styles = template?.styles || {};
  
  const styleMap = {
    h1:          styles.h1 || "GW_一级标题",
    h2:          styles.h2 || "GW_二级标题",
    h3:          styles.h3 || "GW_三级标题",
    h4:          styles.h4 || "GW_四级标题",
    h5:          styles.h5 || "GW_五级标题",
    body:        styles.body || "GW_正文",
    salutation:  styles.salutation || "GW_主送机关",
    signoffOrg:  styles.signoffOrg || "GW_落款机关",
    signoffDate: styles.signoffDate || "GW_落款日期",
    attachment:  styles.attachment || "GW_附件说明",
    colophon:    styles.colophon || "GW_版记",
    title:       styles.title || "GW_主标题"
  };

  const styleName = styleMap[block.type] || styleMap.body;

  const rawText = block.number ? block.number + block.text : block.text;

  // 将 \n 转为 Word 换行符 <w:br/>
  const lines = (rawText || '').split('\n');
  const runs = lines.map((line, i) => {
    const escaped = escapeXml(line);
    const br = i < lines.length - 1
      ? '<w:r><w:br/></w:r>'
      : '';
    return `<w:r><w:t xml:space="preserve">${escaped}</w:t></w:r>${br}`;
  }).join('');

  return `<w:p>
    <w:pPr><w:pStyle w:val="${styleName}"/></w:pPr>
    ${runs}
  </w:p>`;
}

// ── 简化 XML 中占位符被拆分的问题 ──
function mergePlaceholderRuns(xml, placeholder, replacement) {
  // 尝试直接替换（占位符未被拆分的情况）
  if (xml.includes(placeholder)) {
    return xml.replace(placeholder, escapeXml(replacement));
  }
  
  // 占位符可能被拆分成多个 run，需要更复杂的处理
  // 这里使用正则尝试匹配被拆分的占位符
  const placeholderParts = placeholder.slice(2, -2).split(''); // 去掉 {{}}
  const pattern = placeholderParts.map(c => 
    `<w:t[^>]*>[^<]*${c}[^<]*<\/w:t>`
  ).join('[^]*?');
  
  const regex = new RegExp(`<w:r>[^]*?${pattern}[^]*?</w:r>`, 'g');
  
  return xml.replace(regex, `<w:r><w:t>${escapeXml(replacement)}</w:t></w:r>`);
}

// ── 主函数 ──
export async function injectAndDownload(structure, metadata, template) {
  // 如果没有传入模板，使用默认模板
  const currentTemplate = template || templateManager.getTemplate('qsh_redhead');
  
  // 1. 按模板选择模板文件
  const templateUrl = currentTemplate.templateUrl;
  
  // 如果没有模板URL，使用默认模板加载
  let arrayBuffer;
  if (templateUrl) {
    const response = await fetch(templateUrl);
    arrayBuffer = await response.arrayBuffer();
  } else {
    // 根据公文类型加载默认模板
    const docType = currentTemplate.docType;
    arrayBuffer = await loadTemplate(docType);
  }
  
  // 2. PizZip 解压
  const zip = new PizZip(arrayBuffer);
  let xml = zip.file("word/document.xml").asText();

  // 3. 替换元数据占位符
  const replacements = {
    '{{FILE_NUMBER}}': metadata.file_number || structure.file_number || '',
    '{{SALUTATION}}': structure.salutation || '',
    '{{SIGNOFF_ORG}}': structure.signoff?.organization || metadata.organization || '',
    '{{SIGNOFF_DATE}}': structure.signoff?.date || metadata.date || '',
    '{{CC_LIST}}': (structure.cc || metadata.cc || []).join('　'),
    '{{MEETING_NUMBER}}': structure.meeting_number || metadata.meeting_number || '',
    '{{DEPT}}': metadata.dept || '',
    '{{DRAFTER}}': metadata.drafter || '',
    '{{PHONE}}': metadata.phone || '',
    '{{DEPT_REVIEWER}}': metadata.dept_reviewer || '',
    '{{OFFICE_REVIEWER}}': metadata.office_reviewer || '',
    '{{APPROVER}}': metadata.approver || '',
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    xml = mergePlaceholderRuns(xml, placeholder, value);
  }

  // 4. 生成主标题段落 XML（使用模板中的标题样式）
  const titleStyle = currentTemplate.styles?.title || "GW_主标题";
  const titleXml = structure.title ? `<w:p>
    <w:pPr><w:pStyle w:val="${titleStyle}"/></w:pPr>
    <w:r><w:t>${escapeXml(structure.title)}</w:t></w:r>
  </w:p>` : '';

  // 5. 生成全部正文段落 XML（使用模板样式）
  const bodyXml = (structure.body || []).map(block => blockToXml(block, currentTemplate)).join("\n");

  // 6. 生成附件说明 XML（如有）
  let attachXml = '';
  if (structure.attachments && structure.attachments.length > 0) {
    attachXml = structure.attachments.map((a, i) => {
      const prefix = i === 0 ? "附件：" : `      ${i + 1}．`;
      return blockToXml({ type: "attachment", text: prefix + a }, currentTemplate);
    }).join("\n");
  }

  // 7. 替换正文占位符
  const fullBodyXml = [titleXml, bodyXml, attachXml].filter(Boolean).join("\n");
  
  // 尝试多种方式匹配 BODY_PLACEHOLDER
  const bodyPlaceholderPattern = /<w:p[^>]*>[\s\S]*?\{\{BODY_PLACEHOLDER\}\}[\s\S]*?<\/w:p>/;
  if (bodyPlaceholderPattern.test(xml)) {
    xml = xml.replace(bodyPlaceholderPattern, fullBodyXml);
  } else {
    // 尝试匹配被拆分的占位符
    xml = mergePlaceholderRuns(xml, '{{BODY_PLACEHOLDER}}', '');
    // 如果替换成功但内容为空，需要在相应位置插入内容
    if (!xml.includes(fullBodyXml)) {
      xml = xml.replace('</w:body>', fullBodyXml + '</w:body>');
    }
  }

  // 8. 写回并打包
  zip.file("word/document.xml", xml);
  const blob = zip.generate({ 
    type: "blob", 
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
  });

  // 9. 触发下载
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const filename = `${structure.title || "公文"}_${currentTemplate.name}_排版.docx`;
  a.download = filename.replace(/[\\/:*?"<>|]/g, '_'); // 移除非法字符
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return { 
    success: true, 
    filename,
    template: currentTemplate.name,
    standard: currentTemplate.standard 
  };
}

// 导出辅助函数用于测试
export { escapeXml, blockToXml };
