import { Autocomplete, Box, Chip, TextField, createFilterOptions } from "@mui/material";
import React, { useEffect, useState } from "react";

type OptionType = {value: any; label: string};

type Props = {
  label: string;
  value?: any;
  options?: OptionType[];
  onChange?: (value: any) => void;
  onInputChange?: (event: React.SyntheticEvent, inputValue: string) => void;
  multiple?: boolean;
  freeSolo?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  initValue?: any;
  showError?: boolean;
  disableClearable?: boolean;
  size?: 'small' | 'medium';
  // Optional: color selected chips by known status values (tien do)
  statusColorMode?: 'tienDo';
};

const TAutoComplete: React.FC<Props> = ({
  label,
  value: controlledValue,
  options = [],
  onChange,
  onInputChange, // ✅ thêm mới
  multiple = false,
  freeSolo = false,
  required = false,
  error: externalError = true,
  helperText,
  initValue = multiple ? [] : "",
  showError = true,
  disableClearable = false,
  size = 'medium',
  statusColorMode,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<any>(initValue);
  const [error, setError] = useState(false);

  const filter = createFilterOptions<any>({
    matchFrom: 'any',
    stringify: (option) => {
      if (typeof option === 'string') return option;
      if (option && typeof option === 'object' && 'label' in option) {
        return String((option as any).label ?? '');
      }
      return '';
    },
    ignoreCase: true,
    trim: true,
  });

  useEffect(() => {
    const current = controlledValue !== undefined ? controlledValue : uncontrolledValue;
    if (required) {
      setError(multiple ? current.length === 0 : !current);
    }
  }, [controlledValue, uncontrolledValue, required, multiple]);

  useEffect(() => {
    setUncontrolledValue(initValue);
  }, [initValue]);

  // Map id sang object cho Autocomplete
  const getValueObjects = () => {
    const current = controlledValue !== undefined ? controlledValue : uncontrolledValue;
    if (multiple) {
      if (!Array.isArray(current)) return [];
      return current
        .map((v: any) => options.find(opt => opt.value === v))
        .filter(Boolean);
    } else {
      return options.find(opt => opt.value === current) || null;
    }
  };

  const AutocompleteAny = Autocomplete as any;

  return (
    <Box>
      <AutocompleteAny
        size={size}
        multiple={multiple}
        freeSolo={freeSolo}
        options={options}
        filterOptions={filter}
        filterSelectedOptions
        disableCloseOnSelect={multiple}
        clearOnBlur={false}
        isOptionEqualToValue={(option: any, value: any) => {
          const optVal = (option as any)?.value;
          const valVal = (value as any)?.value;
          return optVal === valVal;
        }}
        getOptionLabel={(option: any) => {
          if (typeof option === "string") return option;
          if (Array.isArray(option)) return "";
          return option && typeof option === "object" && "label" in option
            ? option.label
            : "";
        }}
        value={getValueObjects()}
        onChange={(_: any, newValue: any) => {
          if (multiple) {
            const ids = Array.isArray(newValue)
              ? newValue.map((opt: any) =>
                  typeof opt === "object" && "value" in opt ? opt.value : opt
                )
              : [];
            if (controlledValue === undefined) setUncontrolledValue(ids);
            onChange?.(ids);
            if (externalError) setError(ids.length === 0);
          } else {
            const id =
              newValue && typeof newValue === "object" && "value" in newValue
                ? newValue.value
                : newValue ?? "";
            if (controlledValue === undefined) setUncontrolledValue(id);
            onChange?.(id);
            setError(!id);
          }
        }}
        onInputChange={onInputChange}
        renderTags={(selected: any[], getTagProps: any) =>
          selected.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            // Determine chip colors when statusColorMode is enabled
            let chipSx: any = undefined;
            if (statusColorMode === 'tienDo') {
              const value = (option as any)?.value;
              const colorMap: Record<string, {bg: string; color: string}> = {
                DangThucHien: { bg: '#1976D2', color: '#ffffff' },
                DaHoanThanh: { bg: '#43A047', color: '#ffffff' },
                DaHuy: { bg: '#E53935', color: '#ffffff' },
              };
              const c = colorMap[value as string];
              if (c) {
                chipSx = {
                  backgroundColor: c.bg,
                  color: c.color,
                  fontWeight: 600,
                };
              }
            }
            return (
              <Chip
                key={key}
                label={
                  typeof option === "object" && "label" in option
                    ? option.label
                    : String(option)
                }
                sx={chipSx}
                {...tagProps}
              />
            );
          })
        }
        disableClearable={disableClearable}
        renderInput={(params: any) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            size={size}
            error={showError && (externalError || error)}
            helperText={
              showError &&
              (externalError || error
                ? helperText || `${label} không được để trống`
                : "")
            }
          />
        )}
      />
    </Box>
  );
};

export { TAutoComplete };

