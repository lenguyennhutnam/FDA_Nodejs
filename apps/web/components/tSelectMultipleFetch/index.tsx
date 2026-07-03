import { Autocomplete, Chip, FormControl, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

export type OptionType = { value: string | number; label: string };

interface Props {
  label: string;
  fetchOptions?: (input: string) => Promise<OptionType[]>;
  defaultOptions?: (value: unknown) => OptionType[];
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
  error?: boolean;
  helperText?: string;
  formValue?: unknown;
  showError?: boolean;
}

export const TSelectMultipleFetch: React.FC<Props> = ({
  label,
  fetchOptions,
  defaultOptions,
  value = [],
  onChange,
  error = false,
  helperText = "",
  formValue,
  showError = true,
}) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [defaultOps, setDefault] = useState<OptionType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (defaultOptions) {
      const _default = defaultOptions(formValue);
      setDefault(_default);
    }
  }, [formValue, defaultOptions]);

  useEffect(() => {
    // Khi value rỗng, load options mặc định
    const loadDefaultOptions = async () => {
      if (fetchOptions && (!value || value.length === 0)) {
        const fetched = await fetchOptions("");
        setOptions(fetched);
      }
    };
    loadDefaultOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, fetchOptions]);

  // Debounce fetchOptions
  const handleInputChange = (event: React.SyntheticEvent, text: string) => {
    setInputValue(text);
    if (fetchOptions) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const fetched = await fetchOptions(text);
        setOptions(fetched);
      }, 350);
    }
  };

  // Merge default options and fetched options, remove duplicates
  const mergedMap = new Map<string | number, OptionType>();
  [...defaultOps, ...options].forEach((item) => {
    mergedMap.set(item.value, item);
  });
  // Đảm bảo các giá trị đã chọn luôn có trong options
  value.forEach((item) => {
    mergedMap.set(item.value, item);
  });
  const mergedOptions = Array.from(mergedMap.values());

  const AutocompleteAny = Autocomplete as any;

  return (
    <FormControl fullWidth>
      <AutocompleteAny
        multiple
        options={mergedOptions}
        getOptionLabel={(option: any) => option.label || ""}
        value={value}
        onChange={(_: any, newValue: any) => {
          onChange(newValue as OptionType[]);
        }}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        renderTags={(selected: any[], getTagProps: any) =>
          selected.map((option: any, index: any) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={option.label}
                {...tagProps}
              />
            );
          })
        }
        renderInput={(params: any) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            error={showError && error}
            helperText={showError && error ? helperText : ""}
          />
        )}
        filterSelectedOptions
      />
    </FormControl>
  );
};
