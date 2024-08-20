import React from "react";

interface DisabledLabelProps {
  label: string;
  type: string;
  placeholder?: string;
  value?: string;
  horizontal: boolean
}

const DisabledLabel = ({
  label,
  type,
  placeholder,
  value,
  horizontal
}: DisabledLabelProps) => {
  return (
    <div className={`mb-3 flex ${horizontal ? "justify-between items-center gap-5" : "flex-col gap-2"}`}>
      <label className="font-medium text-dark dark:text-white">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled
        className={`${horizontal ? 'w-[75%]' : 'w-full'} rounded-[7px] border-[1.5px] border-gray-1 bg-white px-5 py-2 text-dark outline-none transition disabled:cursor-default disabled:bg-gray disabled:text-dark-secondary font-normal dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark`}
      >
      </input>
    </div>
  );
};

export default DisabledLabel;
