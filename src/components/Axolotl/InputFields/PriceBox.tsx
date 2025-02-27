import React from "react";

interface PriceBoxProps {
  disabled?: boolean;
  value?: number | string;
  placeholder: string;
  name?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isViewOnly?: boolean;
}

const PriceBox = ({
  disabled = true,
  value = "",
  onChange,
  placeholder,
  name,
  required,
  isViewOnly = false
}: PriceBoxProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const isNumericOrEmpty = value === "" || !isNaN(Number(value));
    const isNotLeadingZero = !(value.length === 1 && value[0] === "0");
    const isWithinMaxLength = value.length <= 12;

    if (!isNumericOrEmpty || !isNotLeadingZero || !isWithinMaxLength) return;

    if (onChange) onChange(e);
  };

  return (
    <div className="mb-3 flex w-full flex-col gap-2">
      <label className="font-medium text-dark dark:text-white">
        Price{" "}
        <span className="text-sm font-normal text-dark-secondary">/pcs</span>
        {required && <span className="ml-1 text-red">*</span>}
      </label>
      <div className="flex w-full items-center">
        {!isViewOnly && (
          <span className="flex-none rounded-l-md border border-r-0 border-gray-1 bg-gray p-2 font-normal text-dark-secondary dark:text-white">
            Rp.
          </span>
        )}
        <input
          name={name}
          aria-label="Price"
          type="text"
          placeholder={placeholder}
          value={value === 0 ? "" : value?.toString()}
          onChange={handleInputChange}
          disabled={disabled || isViewOnly}
          maxLength={12}
          className={`${
            isViewOnly
              ? "cursor-not-allowed rounded-md bg-gray-200"
              : "bg-white"
          } flex-1 rounded-r-md border border-gray-1 px-2 py-2 font-normal text-dark outline-none transition ${
            disabled
              ? "disabled:cursor-default disabled:bg-gray disabled:text-dark-secondary"
              : ""
          }`}
        />
      </div>
    </div>
  );
};

export default PriceBox;
