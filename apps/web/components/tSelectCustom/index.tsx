import React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

type Option = {
  value: string | number;
  label: string;
  customLabel?: React.ReactNode;
};

interface TSelectCustomProps {
  label: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  error?: boolean;
  helperText?: string;
}

const TSelectCustom: React.FC<TSelectCustomProps> = ({
  label,
  options,
  value,
  onChange,
  error = false,
  helperText,
}) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.customLabel || option.label}{" "}
            {/* Render customLabel if it exists */}
          </MenuItem>
        ))}
      </Select>
      {helperText && <div>{helperText}</div>} {/* Show helper text if exists */}
    </FormControl>
  );
};

export default TSelectCustom;
