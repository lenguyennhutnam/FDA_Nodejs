import { FormControl } from "@mui/material";
import React, { useEffect, useState } from "react";
import { TAutoComplete } from "../tAutoComplete";

type OptionType = { value: string | number; label: string };

type Props = {
  label: string;
  fetchOptions?: (input: string) => Promise<OptionType[]>;
  defaultOptions?: (value: any) => OptionType[];
  value: string;
  onChange: (value: string | number) => void;
  error?: boolean;
  helperText?: string;
  formValue?: any;
  showError?: boolean;
};

export const TSelectFetch: React.FC<Props> = ({
  label,
  fetchOptions,
  defaultOptions,
  value,
  onChange,
  error = null,
  helperText = "",
  formValue,
  showError = true,
}) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [defaultOps, setDefault] = useState<OptionType[]>([]);

  useEffect(() => {
    if (defaultOptions) {
      const _default = defaultOptions(formValue);
      setDefault(_default);
    }
  }, [formValue]);

  useEffect(() => {
    const loadDefaults = async () => {
      if (fetchOptions && !value) {
        const fetched = await fetchOptions("");
        setOptions(fetched);
      }
    };

    loadDefaults();
  }, [value]);

  const handleInputChange = async (text: string) => {
    if (fetchOptions) {
      const fetched = await fetchOptions(text);
      setOptions(fetched);
    }
  };

  const mergedMap = new Map();

  // Ưu tiên giữ thứ tự: defaults trước, rồi fetched sau
  [...defaultOps, ...options].forEach((item) => {
    mergedMap.set(item?.value?.toString(), item); // `Map` tự loại trùng theo key `value`
  });

  return (
    <FormControl fullWidth>
      <TAutoComplete
        label={label}
        options={Array.from(mergedMap.values())}
        onInputChange={(_, input) => handleInputChange(input)}
        onChange={onChange}
        initValue={value ?? null}
        error={error ?? undefined}
        helperText={helperText}
        showError={showError}
      />
    </FormControl>
  );
};
