/**
 * Word 模板生成器
 * 根据标准配置动态生成 .docx 文件
 * 支持 Q/SH 0758-2019 和 GB/T 9704-2012
 */

import PizZip from 'pizzip';

// 标准配置
const STANDARDS_CONFIG = {
  'qsh_0758_2019': {
    name: 'Q/SH 0758-2019',
    description: '中国石化公文处理规范',
    page: {
      width: 11906,      // A4 宽度 (21cm in twips)
      height: 16838,     // A4 高度 (29.7cm in twips)
      marginTop: 2098,   // 3.7cm
      marginBottom: 1984, // 3.5cm
      marginLeft: 1588,  // 2.8cm
      marginRight: 1474, // 2.6cm
      headerDist: 1418,  // 2.5cm
      footerDist: 1134,  // 2.0cm
    },
    styles: {
      title: { name: 'GW_主标题', font: '方正小标宋简体', size: 44, bold: false }, // 二号 = 22pt = 44 half-points
      h1: { name: 'GW_一级标题', font: '黑体', size: 32, bold: true }, // 三号 = 16pt
      h2: { name: 'GW_二级标题', font: '楷体', size: 32, bold: false },
      h3: { name: 'GW_三级标题', font: '仿宋', size: 32, bold: false },
      h4: { name: 'GW_四级标题', font: '仿宋', size: 32, bold: false },
      body: { name: 'GW_正文', font: '仿宋', size: 32, bold: false },
      salutation: { name: 'GW_主送机关', font: '仿宋', size: 32, bold: false },
      signoffOrg: { name: 'GW_落款机关', font: '仿宋', size: 32, bold: false },
      signoffDate: { name: 'GW_落款日期', font: '仿宋', size: 32, bold: false },
      attachment: { name: 'GW_附件说明', font: '仿宋', size: 32, bold: false },
      colophon: { name: 'GW_版记', font: '仿宋', size: 28, bold: false }, // 四号 = 14pt
    },
    lineHeight: 560, // 28pt line height in twips
    firstLineIndent: 640, // 2 characters indent (approx)
  },
  'gb_t_9704_2012': {
    name: 'GB/T 9704-2012',
    description: '党政机关公文格式国家标准',
    page: {
      width: 11906,
      height: 16838,
      marginTop: 1440,   // 2.54cm
      marginBottom: 1440, // 2.54cm
      marginLeft: 1797,  // 3.17cm
      marginRight: 1797, // 3.17cm
      headerDist: 851,   // 1.5cm
      footerDist: 992,   // 1.75cm
    },
    styles: {
      title: { name: 'GW_主标题', font: '方正小标宋简体', size: 44, bold: false },
      h1: { name: 'GW_一级标题', font: '黑体', size: 32, bold: true },
      h2: { name: 'GW_二级标题', font: '楷体', size: 32, bold: false },
      h3: { name: 'GW_三级标题', font: '仿宋', size: 32, bold: false },
      h4: { name: 'GW_四级标题', font: '仿宋', size: 32, bold: false },
      body: { name: 'GW_正文', font: '仿宋', size: 32, bold: false },
      salutation: { name: 'GW_主送机关', font: '仿宋', size: 32, bold: false },
      signoffOrg: { name: 'GW_落款机关', font: '仿宋', size: 32, bold: false },
      signoffDate: { name: 'GW_落款日期', font: '仿宋', size: 32, bold: false },
      attachment: { name: 'GW_附件说明', font: '仿宋', size: 32, bold: false },
      colophon: { name: 'GW_版记', font: '仿宋', size: 28, bold: false },
    },
    lineHeight: 560,
    firstLineIndent: 640,
  }
};

// 公文类型占位符配置
const DOC_TYPE_PLACEHOLDERS = {
  'qsh_redhead': ['{{FILE_NUMBER}}', '{{SALUTATION}}', '{{BODY_PLACEHOLDER}}', '{{SIGNOFF_ORG}}', '{{SIGNOFF_DATE}}', '{{CC_LIST}}'],
  'gb_redhead': ['{{FILE_NUMBER}}', '{{SALUTATION}}', '{{BODY_PLACEHOLDER}}', '{{SIGNOFF_ORG}}', '{{SIGNOFF_DATE}}', '{{CC_LIST}}'],
  'qsh_workform': ['{{DEPT}}', '{{DRAFTER}}', '{{PHONE}}', '{{DEPT_REVIEWER}}', '{{OFFICE_REVIEWER}}', '{{APPROVER}}', '{{BODY_PLACEHOLDER}}'],
  'gb_notice': ['{{FILE_NUMBER}}', '{{SALUTATION}}', '{{BODY_PLACEHOLDER}}', '{{SIGNOFF_ORG}}', '{{SIGNOFF_DATE}}', '{{CC_LIST}}'],
};

/**
 * 生成样式定义 XML
 */
function generateStylesXml(config) {
  const { styles, lineHeight, firstLineIndent } = config;
  
  const styleDefs = Object.entries(styles).map(([key, style]) => {
    const isTitle = key === 'title';
    const isSignoffOrg = key === 'signoffOrg';
    const isSignoffDate = key === 'signoffDate';
    const isColophon = key === 'colophon';
    
    let alignment = 'left';
    let indentLeft = 0;
    let indentRight = 0;
    let indentFirst = 0;
    
    if (isTitle) {
      alignment = 'center';
    } else if (isSignoffOrg) {
      alignment = 'right';
      indentRight = 640; // 4 characters
    } else if (isSignoffDate) {
      alignment = 'center';
    } else if (isColophon) {
      indentLeft = 320; // 1 character
      indentRight = 320;
    } else {
      indentFirst = firstLineIndent;
    }
    
    return `
    <w:style w:type="paragraph" w:styleId="${style.name}">
      <w:name w:val="${style.name}"/>
      <w:pPr>
        <w:jc w:val="${alignment}"/>
        <w:spacing w:line="${lineHeight}" w:lineRule="exact"/>
        ${indentFirst ? `<w:ind w:firstLine="${indentFirst}"/>` : ''}
        ${indentLeft ? `<w:ind w:left="${indentLeft}" w:right="${indentRight}"/>` : ''}
        ${isSignoffOrg ? `<w:ind w:right="${indentRight}"/>` : ''}
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="${style.font}" w:eastAsia="${style.font}" w:hAnsi="${style.font}"/>
        <w:sz w:val="${style.size}"/>
        <w:szCs w:val="${style.size}"/>
        ${style.bold ? '<w:b/><w:bCs/>' : ''}
      </w:rPr>
    </w:style>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  ${styleDefs}
</w:styles>`;
}

/**
 * 生成文档主体 XML
 */
function generateDocumentXml(config, placeholders) {
  const { page } = config;
  
  const placeholderParas = placeholders.map(p => `
    <w:p>
      <w:r>
        <w:t>${p}</w:t>
      </w:r>
    </w:p>`).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${placeholderParas}
    <w:sectPr>
      <w:pgSz w:w="${page.width}" w:h="${page.height}"/>
      <w:pgMar w:top="${page.marginTop}" w:right="${page.marginRight}" w:bottom="${page.marginBottom}" w:left="${page.marginLeft}"
               w:header="${page.headerDist}" w:footer="${page.footerDist}" w:gutter="0"/>
      <w:cols w:space="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

/**
 * 生成页眉页脚 XML
 */
function generateHeaderFooterXml(docType, standard) {
  const isRedhead = docType.includes('redhead');
  const isGB = standard === 'gb_t_9704_2012';
  
  // 红头文件页眉（有红色横线）
  if (isRedhead) {
    return {
      header1: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:color w:val="CC0000"/>
        <w:sz w:val="44"/>
        <w:rFonts w:eastAsia="方正小标宋简体"/>
      </w:rPr>
      <w:t>发文机关标志</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:pPr>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="12" w:space="1" w:color="CC0000"/>
      </w:pBdr>
    </w:pPr>
    <w:r>
      <w:t></w:t>
    </w:r>
  </w:p>
</w:hdr>`,
      footer1: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="right"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:eastAsia="宋体"/>
        <w:sz w:val="28"/>
      </w:rPr>
      <w:t>— </w:t>
    </w:r>
    <w:r>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:instrText>PAGE</w:instrText>
    </w:r>
    <w:r>
      <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
      <w:t>1</w:t>
    </w:r>
    <w:r>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:eastAsia="宋体"/>
        <w:sz w:val="28"/>
      </w:rPr>
      <w:t> —</w:t>
    </w:r>
  </w:p>
</w:ftr>`
    };
  }
  
  // 普通页眉页脚
  return {
    header1: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:r>
      <w:t></w:t>
    </w:r>
  </w:p>
</w:hdr>`,
    footer1: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:instrText>PAGE</w:instrText>
    </w:r>
    <w:r>
      <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
      <w:t>1</w:t>
    </w:r>
    <w:r>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
  </w:p>
</w:ftr>`
  };
}

/**
 * 生成 [Content_Types].xml
 */
function generateContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;
}

/**
 * 生成 _rels/.rels
 */
function generateRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

/**
 * 生成 word/_rels/document.xml.rels
 */
function generateDocumentRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;
}

/**
 * 生成完整模板
 */
export function generateTemplate(standardId, docType) {
  const config = STANDARDS_CONFIG[standardId];
  if (!config) {
    throw new Error(`未知标准: ${standardId}`);
  }
  
  const placeholders = DOC_TYPE_PLACEHOLDERS[docType] || ['{{BODY_PLACEHOLDER}}'];
  const headerFooter = generateHeaderFooterXml(docType, standardId);
  
  // 创建 zip
  const zip = new PizZip();
  
  // 添加文件
  zip.file('[Content_Types].xml', generateContentTypesXml());
  zip.file('_rels/.rels', generateRelsXml());
  zip.file('word/_rels/document.xml.rels', generateDocumentRelsXml());
  zip.file('word/styles.xml', generateStylesXml(config));
  zip.file('word/document.xml', generateDocumentXml(config, placeholders));
  zip.file('word/header1.xml', headerFooter.header1);
  zip.file('word/footer1.xml', headerFooter.footer1);
  
  // 生成 blob
  return zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

/**
 * 下载生成的模板
 */
export function downloadTemplate(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { STANDARDS_CONFIG, DOC_TYPE_PLACEHOLDERS };
export default generateTemplate;
