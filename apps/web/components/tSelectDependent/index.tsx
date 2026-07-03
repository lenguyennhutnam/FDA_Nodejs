import { useState, useEffect } from "react";
import { TSelect } from "../tSelect"; // 👈 dùng TSelect thay vì TAutoComplete

interface Props {
  label: string;
  parentValue: any;
  value: any;
  onChange: (value: any) => void;
  getOptionsFromParent: (
    parentValue: any
  ) => Promise<{ value: string | number; label: string }[]>;
  error?: boolean;
  helperText?: string;
}

export const TSelectDependent: React.FC<Props> = ({
  label,
  parentValue,
  value,
  onChange,
  getOptionsFromParent,
  error,
  helperText,
}) => {
  const [options, setOptions] = useState<
    { value: string | number; label: string }[]
  >([]);
  useEffect(() => {
    if (parentValue !== undefined && parentValue !== null) {
      getOptionsFromParent(parentValue).then(setOptions);
    }
  }, [parentValue]);

  useEffect(() => {
    if (!parentValue) {
      setOptions([]);
      onChange(null);
    }
  }, [parentValue]);

  return (
    <TSelect
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
    />
  );
};
