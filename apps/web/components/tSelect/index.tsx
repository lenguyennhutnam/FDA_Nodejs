import {
  Box,
  Chip,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { useEffect, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";

type Props = {
  label: string;
  allowClear?: boolean;
  options?: { value: any; label: string }[];
  onChange?: (value: any) => void;
  error?: boolean;
  helperText?: string;
};

const TSelect = (props: Props & SelectProps) => {
  const {
    label,
    allowClear = true,
    options = [],
    onChange,
    error,
    helperText,
    ...otherProps
  } = props;

  const [value, setValue] = useState<any>(props.multiple ? [] : "");

  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value);
    }
  }, [props.value]);

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    const newValue = props?.multiple ? [] : "";
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleDeleteTag = (valueRemove: any) => {
    const newValue = value.filter((e: any) => e !== valueRemove);
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleChange = (event: any) => {
    const newValue = event.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="tselect-label">{label}</InputLabel>
      <Select
        labelId="tselect-label"
        id="tselect"
        label={label}
        value={value}
        onChange={handleChange}
        renderValue={(selected: any) =>
          selected ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {props.multiple ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((val: any) => {
                    const option = options.find((opt) => opt.value === val);
                    return (
                      <Chip
                        key={val}
                        label={option?.label}
                        onDelete={() => handleDeleteTag(val)}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    );
                  })}
                </Box>
              ) : (
                <span>{options.find((opt) => opt.value === value)?.label}</span>
              )}
              {allowClear && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </div>
          ) : null
        }
        {...otherProps}
      >
        {options?.map((e) => (
          <MenuItem key={e?.value} value={e?.value}>
            {e?.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export { TSelect };
