// 这些字符串必须与 Word 模板中的样式名称完全一致（区分大小写）
export const STYLE = {
  title:       "GW_主标题",
  h1:          "GW_一级标题",
  h2:          "GW_二级标题",
  h3:          "GW_三级标题",
  h4:          "GW_四级标题",
  body:        "GW_正文",
  salutation:  "GW_主送机关",
  signoffOrg:  "GW_落款机关",
  signoffDate: "GW_落款日期",
  attachment:  "GW_附件说明",
  colophon:    "GW_版记",
};

// 段落类型映射
export const BLOCK_TYPES = {
  h1: '一级标题',
  h2: '二级标题',
  h3: '三级标题',
  h4: '四级标题',
  h5: '五级标题',
  body: '正文',
  salutation: '主送机关',
  signoffOrg: '落款机关',
  signoffDate: '成文日期',
  attachment: '附件说明',
  blank: '空行',
};

// 公文类型
export const DOC_TYPES = {
  redhead: '红头文件',
  worksheet: '工作表单',
  minutes: '会议纪要',
};
