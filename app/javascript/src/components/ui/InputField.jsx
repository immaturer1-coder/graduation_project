import React from 'react';

/**
 * Path: app/javascript/src/components/ui/InputField.jsx
 * アイコンとラベル付きの標準入力フィールド
 */
const InputField = ({ label, type, placeholder, icon: Icon, value, onChange }) => {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Icon size={16} />
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputField;