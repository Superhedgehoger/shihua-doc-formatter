import { DOC_TYPES } from '../constants/styleNames.js';

const FIELDS = {
  file_number: { label: '发文字号', placeholder: '如：销售工单鲁办〔2024〕1号' },
  salutation: { label: '主送机关', placeholder: '如：各部门：' },
  date: { label: '成文日期', placeholder: '如：2024年1月15日' },
  organization: { label: '发文机关', placeholder: '如：某某石油分公司' },
  cc: { label: '抄送机关', placeholder: '多个用顿号分隔' },
  meeting_number: { label: '纪要编号', placeholder: '如：第1期' },
  dept: { label: '拟稿部门', placeholder: '' },
  drafter: { label: '拟稿人', placeholder: '' },
  phone: { label: '联系电话', placeholder: '' },
  dept_reviewer: { label: '部门核稿', placeholder: '' },
  office_reviewer: { label: '办公室核稿', placeholder: '' },
  approver: { label: '签发人', placeholder: '' },
};

// 各公文类型显示的字段
const FIELD_CONFIG = {
  '红头文件': ['file_number', 'salutation', 'organization', 'date', 'cc'],
  '工作表单': ['salutation', 'organization', 'date', 'dept', 'drafter', 'phone', 'dept_reviewer', 'office_reviewer', 'approver'],
  '会议纪要': ['meeting_number', 'date'],
};

export default function MetadataForm({ docType, metadata, onChange }) {
  const fields = FIELD_CONFIG[docType] || [];

  const handleChange = (field, value) => {
    onChange({ ...metadata, [field]: value });
  };

  if (fields.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">元数据（可选）</h3>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((fieldKey) => {
          const field = FIELDS[fieldKey];
          return (
            <div key={fieldKey} className={fieldKey === 'cc' || fieldKey === 'salutation' ? 'col-span-2' : ''}>
              <label className="block text-xs text-gray-600 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={metadata[fieldKey] || ''}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
