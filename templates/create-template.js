/**
 * 生成石化公文 Word 模板文件
 * 
 * 使用方法:
 * node create-template.js
 * 
 * 此脚本会生成 3 个基础模板文件：
 * - 红头文件.docx
 * - 工作表单.docx
 * - 会议纪要.docx
 * 
 * 注意：生成的模板为基础结构，建议在 Word 中打开后进一步美化：
 * - 添加页眉红线（红头文件）
 * - 调整字体为方正小标宋简体（需本地安装）
 * - 微调页边距和样式
 */

import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Word 文档的基础 XML 结构
function createDocumentXml(content, styles = '') {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:body>
    ${content}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="2098" w:right="1474" w:bottom="1984" w:left="1588" w:header="1418" w:footer="1134"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

// 创建样式 XML
function createStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="GW_主标题">
    <w:name w:val="GW_主标题"/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="SimSun" w:hAnsi="SimSun" w:eastAsia="方正小标宋简体"/>
      <w:sz w:val="44"/>
      <w:szCs w:val="44"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_一级标题">
    <w:name w:val="GW_一级标题"/>
    <w:pPr>
      <w:ind w:firstLineChars="200" w:firstLine="640"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="SimHei" w:hAnsi="SimHei" w:eastAsia="SimHei"/>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_二级标题">
    <w:name w:val="GW_二级标题"/>
    <w:pPr>
      <w:ind w:firstLineChars="200" w:firstLine="640"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="KaiTi" w:hAnsi="KaiTi" w:eastAsia="KaiTi"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_三级标题">
    <w:name w:val="GW_三级标题"/>
    <w:pPr>
      <w:ind w:firstLineChars="200" w:firstLine="640"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_四级标题">
    <w:name w:val="GW_四级标题"/>
    <w:pPr>
      <w:ind w:firstLineChars="200" w:firstLine="640"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_正文">
    <w:name w:val="GW_正文"/>
    <w:pPr>
      <w:ind w:firstLineChars="200" w:firstLine="640"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_主送机关">
    <w:name w:val="GW_主送机关"/>
    <w:pPr>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_落款机关">
    <w:name w:val="GW_落款机关"/>
    <w:pPr>
      <w:jc w:val="right"/>
      <w:ind w:rightChars="400" w:right="1600"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_落款日期">
    <w:name w:val="GW_落款日期"/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_附件说明">
    <w:name w:val="GW_附件说明"/>
    <w:pPr>
      <w:ind w:firstLineChars="200" w:firstLine="640"/>
      <w:spacing w:line="560" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="GW_版记">
    <w:name w:val="GW_版记"/>
    <w:pPr>
      <w:ind w:leftChars="100" w:left="424" w:rightChars="100" w:right="424"/>
      <w:spacing w:line="440" w:lineRule="exact"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="FangSong" w:hAnsi="FangSong" w:eastAsia="FangSong"/>
      <w:sz w:val="28"/>
      <w:szCs w:val="28"/>
    </w:rPr>
  </w:style>
</w:styles>`;
}

// 创建红头文件内容
function createRedheadContent() {
  return `
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>{{FILE_NUMBER}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="400"/></w:pPr>
      <w:r><w:t>{{BODY_PLACEHOLDER}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r><w:t>{{SALUTATION}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="right"/><w:ind w:rightChars="400" w:right="1600"/></w:pPr>
      <w:r><w:t>{{SIGNOFF_ORG}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>{{SIGNOFF_DATE}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="400"/></w:pPr>
      <w:r><w:t>{{CC_LIST}}</w:t></w:r>
    </w:p>`;
}

// 创建工作表单内容
function createWorksheetContent() {
  return `
    <w:tbl>
      <w:tr><w:tc><w:p><w:r><w:t>拟稿部门</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>{{DEPT}}</w:t></w:r></w:p></w:tc>
      <w:tc><w:p><w:r><w:t>拟稿人</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>{{DRAFTER}}</w:t></w:r></w:p></w:tc></w:tr>
      <w:tr><w:tc><w:p><w:r><w:t>联系电话</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>{{PHONE}}</w:t></w:r></w:p></w:tc>
      <w:tc><w:p><w:r><w:t>部门核稿</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>{{DEPT_REVIEWER}}</w:t></w:r></w:p></w:tc></w:tr>
      <w:tr><w:tc><w:p><w:r><w:t>办公室核稿</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>{{OFFICE_REVIEWER}}</w:t></w:r></w:p></w:tc>
      <w:tc><w:p><w:r><w:t>签发人</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>{{APPROVER}}</w:t></w:r></w:p></w:tc></w:tr>
    </w:tbl>
    <w:p>
      <w:pPr><w:spacing w:before="400"/></w:pPr>
      <w:r><w:t>{{BODY_PLACEHOLDER}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r><w:t>{{SALUTATION}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="right"/><w:ind w:rightChars="400" w:right="1600"/></w:pPr>
      <w:r><w:t>{{SIGNOFF_ORG}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>{{SIGNOFF_DATE}}</w:t></w:r>
    </w:p>`;
}

// 创建会议纪要内容
function createMinutesContent() {
  return `
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>{{MEETING_NUMBER}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="400"/></w:pPr>
      <w:r><w:t>{{BODY_PLACEHOLDER}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>{{SIGNOFF_DATE}}</w:t></w:r>
    </w:p>`;
}

// 创建关系文件
function createRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

// 创建 [Content_Types].xml
function createContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
}

// 生成 .docx 文件
function generateDocx(filename, contentGenerator) {
  const zip = new PizZip();
  
  // 添加文档内容
  zip.folder('word').file('document.xml', createDocumentXml(contentGenerator()));
  zip.folder('word').file('styles.xml', createStylesXml());
  zip.folder('word').file('_rels/document.xml.rels', createRelsXml());
  zip.file('[Content_Types].xml', createContentTypesXml());
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // 生成文件
  const output = zip.generate({ type: 'nodebuffer' });
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, output);
  console.log(`✅ 已生成: ${filepath}`);
}

// 主函数
console.log('📝 生成石化公文 Word 模板...\n');

generateDocx('红头文件.docx', createRedheadContent);
generateDocx('工作表单.docx', createWorksheetContent);
generateDocx('会议纪要.docx', createMinutesContent);

console.log('\n✨ 模板生成完成！');
console.log('\n📋 后续步骤：');
console.log('1. 在 Microsoft Word 中打开模板文件');
console.log('2. 设置页面边距：上3.7cm、下3.5cm、左2.8cm、右2.6cm');
console.log('3. 红头文件模板：添加页眉红线（红色横线）');
console.log('4. 调整样式字体为方正小标宋简体（如已安装）');
console.log('5. 保存后模板即可使用\n');
