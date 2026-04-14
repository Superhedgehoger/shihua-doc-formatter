// Vite 构建时将 .docx 复制到 dist/assets/ 并返回哈希文件名 URL
// vite dev 时直接返回本地开发服务器路径，两种模式代码不变

// 使用 URL 导入，Vite 会自动处理
const templateModules = import.meta.glob('../../templates/*.docx', { eager: true, as: 'url' });

export const TEMPLATE_URLS = {
  "红头文件": templateModules['../../templates/红头文件.docx'] || '',
  "工作表单": templateModules['../../templates/工作表单.docx'] || '',
  "会议纪要": templateModules['../../templates/会议纪要.docx'] || '',
};

export async function loadTemplate(docType) {
  const url = TEMPLATE_URLS[docType];
  if (!url) {
    throw new Error(`未找到模板: ${docType}`);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`加载模板失败: ${response.status}`);
  }
  return await response.arrayBuffer();
}
