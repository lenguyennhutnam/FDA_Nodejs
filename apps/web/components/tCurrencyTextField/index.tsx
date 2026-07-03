import { TextFieldProps } from "@mui/material/TextField";
import React from "react";
import { TTextField } from "../tTextField";

type Props = {
  label: string;
  value: number | string;
  onChange: (value: number) => void; // ✅ Trả về number thay vì string
} & TextFieldProps;

const TCurrencyTextField: React.FC<Props> = ({
  value,
  onChange,
  label,
  ...otherProps
}) => {
  return (
    <TTextField
      label={label}
      value={value}
      onValueChange={(values) => {
        const numericValue = values.floatValue || 0; // ✅ Trả về dạng number
        onChange(numericValue);
      }}
      type="currency"
      fullWidth
      {...otherProps}
    />
  );
};

export { TCurrencyTextField };
