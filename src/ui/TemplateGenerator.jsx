import { useState } from 'react';
import PizZip from 'pizzip';
import { STANDARDS, DOC_TYPES } from '../constants/templateRegistry.js';

/**
 * 模板生成器组件
 * 根据选择的公文类型和标准动态生成 Word 模板文件
 */
function TemplateGenerator({ isOpen, onClose }) {
  const [selectedStandard, setSelectedStandard] = useState('qsh_0758_2019');
  const [selectedDocType, setSelectedDocType] = useState('qsh_redhead');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const standard = STANDARDS[selectedStandard];
  const docType = DOC_TYPES[selectedDocType];

  // 生成 Word 模板的 XML 内容
  const generateDocumentXml = () => {
    const margins = standard.margins;
    const headerDist = selectedStandard === 'qsh_0758_2019' ? 2.5 : 1.5; // cm
    const footerDist = selectedStandard === 'qsh_0758_2019' ? 2.0 : 1.75; // cm

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- 红头线区域 -->
    ${docType.hasRedLine ? generateRedheadSection() : ''}
    
    <!-- 发文字号区域 -->
    ${docType.hasFileNumber ? generateFileNumberSection() : ''}
    
    <!-- 标题区域 -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="200" w:line="600" w:lineRule="exact"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="方正小标宋简体" w:eastAsia="方正小标宋简体"/>
          <w:sz w:val="44"/>
          <w:szCs w:val="44"/>
        </w:rPr>
        <w:t>{{TITLE}}</w:t>
      </w:r>
    </w:p>
    
    <!-- 主送机关 -->
    ${docType.hasSalutation ? generateSalutationSection() : ''}
    
    <!-- 正文占位符 -->
    <w:p>
      <w:pPr>
        <w:spacing w:line="560" w:lineRule="exact"/>
        <w:ind w:firstLine="640"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312" w:hAnsi="Times New Roman"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>{{BODY_PLACEHOLDER}}</w:t>
      </w:r>
    </w:p>
    
    <!-- 落款区域 -->
    ${docType.hasSignature ? generateSignatureSection() : ''}
    
    <!-- 印章区域 -->
    ${docType.hasSeal ? generateSealSection() : ''}
    
    <!-- 附注区域 -->
    ${docType.hasDistribution ? generateDistributionSection() : ''}
    
    <!-- 附件说明 -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="200" w:line="560" w:lineRule="exact"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>{{ATTACHMENTS}}</w:t>
      </w:r>
    </w:p>
    
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="${Math.round(margins.top * 567)}" 
               w:right="${Math.round(margins.right * 567)}" 
               w:bottom="${Math.round(margins.bottom * 567)}" 
               w:left="${Math.round(margins.left * 567)}" 
               w:header="${Math.round(headerDist * 567)}" 
               w:footer="${Math.round(footerDist * 567)}" 
               w:gutter="0"/>
      <w:cols w:space="425"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  };

  // 生成红头部分
  const generateRedheadSection = () => `
    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" w:line="600" w:lineRule="exact"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="方正小标宋简体" w:eastAsia="方正小标宋简体"/>
          <w:color w:val="C00000"/>
          <w:sz w:val="44"/>
          <w:szCs w:val="44"/>
        </w:rPr>
        <w:t>{{REDHEAD_TITLE}}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:before="100" w:after="100"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:color w:val="C00000"/>
        </w:rPr>
        <w:pict>
          <v:shapetype id="_x0000_t32" coordsize="21600,21600" o:spt="32" o:oned="t" path="m,l21600,21600e">
            <v:path arrowok="t" fillok="f" o:connecttype="none"/>
          </v:shapetype>
          <v:shape id="PowerPlusWaterMarkObject" o:spid="_x0000_s2049" type="#_x0000_t32" 
                   style="position:absolute;margin-left:0;margin-top:0;width:468pt;height:2pt;z-index:-251658752;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-position-vertical-relative:margin" 
                   o:allowincell="f" fillcolor="#C00000" stroked="f">
          </v:shape>
        </w:pict>
      </w:r>
    </w:p>`;

  // 生成发文字号部分
  const generateFileNumberSection = () => `
    <w:p>
      <w:pPr>
        <w:spacing w:before="100" w:after="200" w:line="560" w:lineRule="exact"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>{{FILE_NUMBER}}</w:t>
      </w:r>
    </w:p>`;

  // 生成主送机关部分
  const generateSalutationSection = () => `
    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="100" w:line="560" w:lineRule="exact"/>
        <w:ind w:firstLine="0"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>{{SALUTATION}}</w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>：</w:t>
      </w:r>
    </w:p>`;

  // 生成落款部分
  const generateSignatureSection = () => `
    <w:p>
      <w:pPr>
        <w:spacing w:before="400" w:line="560" w:lineRule="exact"/>
        <w:jc w:val="right"/>
        <w:ind w:right="900"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>{{SIGNATURE_ORG}}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:line="560" w:lineRule="exact"/>
        <w:jc w:val="right"/>
        <w:ind w:right="900"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>{{SIGNATURE_DATE}}</w:t>
      </w:r>
    </w:p>`;

  // 生成印章占位符
  const generateSealSection = () => `
    <w:p>
      <w:pPr>
        <w:spacing w:before="100" w:line="560" w:lineRule="exact"/>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>（印章位置）</w:t>
      </w:r>
    </w:p>`;

  // 生成附注部分
  const generateDistributionSection = () => `
    <w:p>
      <w:pPr>
        <w:spacing w:before="300" w:line="560" w:lineRule="exact"/>
        <w:ind w:left="320" w:hanging="320"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>（</w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>{{DISTRIBUTION}}</w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>）</w:t>
      </w:r>
    </w:p>`;

  // 生成样式 XML
  const generateStylesXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312" w:hAnsi="Times New Roman"/>
        <w:sz w:val="32"/>
        <w:szCs w:val="32"/>
        <w:lang w:val="zh-CN" w:eastAsia="zh-CN"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  
  <!-- 正文样式 -->
  <w:style w:type="paragraph" w:styleId="GW_正文" w:default="1">
    <w:name w:val="GW Body Text"/>
    <w:rPr>
      <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312" w:hAnsi="Times New Roman"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
    <w:pPr>
      <w:spacing w:line="560" w:lineRule="exact"/>
      <w:ind w:firstLine="640"/>
    </w:pPr>
  </w:style>
  
  <!-- 一级标题 -->
  <w:style w:type="paragraph" w:styleId="GW_一级标题">
    <w:name w:val="GW Heading 1"/>
    <w:rPr>
      <w:rFonts w:ascii="黑体" w:eastAsia="黑体"/>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
    <w:pPr>
      <w:spacing w:before="200" w:after="100" w:line="560" w:lineRule="exact"/>
      <w:ind w:firstLine="0"/>
    </w:pPr>
  </w:style>
  
  <!-- 二级标题 -->
  <w:style w:type="paragraph" w:styleId="GW_二级标题">
    <w:name w:val="GW Heading 2"/>
    <w:rPr>
      <w:rFonts w:ascii="楷体_GB2312" w:eastAsia="楷体_GB2312"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
    <w:pPr>
      <w:spacing w:before="100" w:after="50" w:line="560" w:lineRule="exact"/>
      <w:ind w:firstLine="0"/>
    </w:pPr>
  </w:style>
  
  <!-- 三级标题 -->
  <w:style w:type="paragraph" w:styleId="GW_三级标题">
    <w:name w:val="GW Heading 3"/>
    <w:rPr>
      <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
    <w:pPr>
      <w:spacing w:before="50" w:after="50" w:line="560" w:lineRule="exact"/>
      <w:ind w:firstLine="0"/>
    </w:pPr>
  </w:style>
  
  <!-- 附件说明 -->
  <w:style w:type="paragraph" w:styleId="GW_附件说明">
    <w:name w:val="GW Attachment"/>
    <w:rPr>
      <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
    <w:pPr>
      <w:spacing w:before="100" w:line="560" w:lineRule="exact"/>
      <w:ind w:firstLine="640"/>
    </w:pPr>
  </w:style>
  
  <!-- 附注 -->
  <w:style w:type="paragraph" w:styleId="GW_附注">
    <w:name w:val="GW Note"/>
    <w:rPr>
      <w:rFonts w:ascii="仿宋_GB2312" w:eastAsia="仿宋_GB2312"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
    <w:pPr>
      <w:spacing w:before="100" w:line="560" w:lineRule="exact"/>
      <w:ind w:left="320" w:hanging="320"/>
    </w:pPr>
  </w:style>
</w:styles>`;

  // 生成 [Content_Types].xml
  const generateContentTypesXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  // 生成 _rels/.rels
  const generateRelsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  // 生成 word/_rels/document.xml.rels
  const generateDocumentRelsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // 生成模板
  const generateTemplate = async () => {
    setIsGenerating(true);
    
    try {
      const zip = new PizZip();
      
      // 添加必要的文件
      zip.file('[Content_Types].xml', generateContentTypesXml());
      zip.folder('_rels').file('.rels', generateRelsXml());
      zip.folder('word').file('document.xml', generateDocumentXml());
      zip.folder('word').file('styles.xml', generateStylesXml());
      zip.folder('word/_rels').file('document.xml.rels', generateDocumentRelsXml());
      
      // 生成文件
      const blob = zip.generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      // 下载
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docType.name}_${standard.shortName}_模板.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('生成模板失败:', error);
      alert('生成模板失败: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-[600px] max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div>
              <h2 
                className="text-lg font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                生成 Word 模板
              </h2>
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                根据公文标准生成 .docx 模板文件
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 标准选择 */}
          <div>
            <h3 
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              选择公文标准
            </h3>
            <div className="space-y-2">
              {Object.entries(STANDARDS).map(([id, std]) => (
                <div
                  key={id}
                  onClick={() => setSelectedStandard(id)}
                  className="p-4 rounded-xl border cursor-pointer transition-all"
                  style={{ 
                    background: selectedStandard === id ? 'rgba(94, 106, 210, 0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: selectedStandard === id ? 'var(--brand-indigo)' : 'var(--border-standard)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 
                        className="font-medium text-sm mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {std.name}
                      </h4>
                      <p 
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {std.description}
                      </p>
                    </div>
                    {selectedStandard === id && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-indigo)" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <div 
                    className="flex gap-4 mt-3 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>上边距: {std.margins.top}cm</span>
                    <span>下边距: {std.margins.bottom}cm</span>
                    <span>左边距: {std.margins.left}cm</span>
                    <span>右边距: {std.margins.right}cm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 公文类型选择 */}
          <div>
            <h3 
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              选择公文类型
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(DOC_TYPES).map(([id, type]) => (
                <div
                  key={id}
                  onClick={() => setSelectedDocType(id)}
                  className="p-4 rounded-xl border cursor-pointer transition-all"
                  style={{ 
                    background: selectedDocType === id ? 'rgba(94, 106, 210, 0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: selectedDocType === id ? 'var(--brand-indigo)' : 'var(--border-standard)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ 
                        background: selectedDocType === id ? 'var(--brand-indigo)' : 'rgba(255,255,255,0.05)',
                        color: 'white'
                      }}
                    >
                      {type.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-medium text-sm truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {type.name}
                      </h4>
                      <p 
                        className="text-xs truncate"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {type.category}
                      </p>
                    </div>
                    {selectedDocType === id && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-indigo)" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <div 
                    className="flex flex-wrap gap-1 mt-2"
                  >
                    {type.hasRedLine && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ background: 'rgba(192,0,0,0.1)', color: '#fca5a5' }}
                      >
                        红头
                      </span>
                    )}
                    {type.hasFileNumber && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                      >
                        文号
                      </span>
                    )}
                    {type.hasSignature && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                      >
                        落款
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 模板预览说明 */}
          <div 
            className="p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <h3 
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              模板将包含
            </h3>
            <ul 
              className="space-y-1 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <li className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                符合 {standard.name} 规范的页面设置
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                预设的公文样式（正文、标题等）
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                {docType.name} 专用占位符
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                可直接在 Word 中编辑使用
              </li>
            </ul>
          </div>
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
          <button
            onClick={generateTemplate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            style={{ 
              background: 'var(--brand-indigo)',
              color: 'white'
            }}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
                </svg>
                生成中...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                下载模板
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateGenerator;
