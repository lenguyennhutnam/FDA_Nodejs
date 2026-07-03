import { Warning } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import dayjs from "dayjs";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { formatTime } from "../../types";
import { TAutoComplete } from "../tAutoComplete";
import { TDatePicker } from "../tDatePicker";
import { TDateTimePicker } from "../tDateTimePicker";
import { TLabelFetch } from "../tLabelFetch";
import TSelectCustom from "../tSelectCustom";
import { TSelectDependent } from "../tSelectDependent";
import { TSelectFetch } from "../tSelectFetch";
import { TSelectMultipleFetch } from "../tSelectMultipleFetch";
import { TStarRating } from "../tStarRating";
import { TTextField } from "../tTextField";
import { TTimePicker } from "../tTimePicker";
import { ToggleInput } from "../tToggleInput";
import { TTreeSelect } from "../tTreeSelect";
import { TYearPicker } from "../tYearPicker";

interface Column {
  id: string;
  label: string;
  type?: string; // "select-coupon", "label", "coupon", "label-fetch", "text", "number", "email", "date", "textarea", "select", "date-time", "switch", "select-fetch", "hidden", "time", "multi-select", "toggle-input", "user-assignment", "file"
  required?: boolean;
  options?: {
    value: string | number;
    label?: string;
    customLabel?: React.Component;
  }[];
  format?: formatTime;
  size?: any;
  condition?: (formData: Record<string, any>) => boolean;
  fetchOptions?: (
    input: string
  ) => Promise<{value: string | number; label: string}[]>;
  fetchLabel?: (formData: Record<string, any>) => Promise<string>; // label-fetch
  callOnce?: boolean; //label-fetch
  fetchCouponInfo?: (ma: string) => Promise<{
    loai: string;
    giam?: number;
    giam_phan_tram?: number;
    valid: boolean;
    message?: string;
  }>; // 👈 API xác minh
  parentId?: string; // 👈 field phụ thuộc select-dependent
  getOptionsFromParent?: (
    parentValue: any
  ) => Promise<{value: string | number; label: string}[]>;
  defaultOptions?: (
    formData: Record<string, any>
  ) => {value: string | number; label: string}[];
  onChange?: (formData: Record<string, any>, value: any) => void | Record<string, any>;
  validate?: (formData: Record<string, any>) => string | null;
  // ✅ Thêm async validation
  asyncValidate?: (
    formData: Record<string, any>,
    value: any
  ) => Promise<string | null>;
  debounceMs?: number; // Thời gian debounce cho async validation (mặc định 500ms)
  skipRequiredValidation?: boolean; // Bỏ qua validation required khi có asyncValidate
  disableClearable?: boolean;
  hidden?: boolean;
  component?: string;
  // ToggleInput specific properties
  toggleOptions?: Array<{value: string; label: string}>;
  onSaveToCategory?: (value: string) => Promise<void>;
  onSaveSuccess?: () => void;
  multiline?: boolean;
  rows?: number;
  isMultiSelect?: boolean;
  // File upload specific properties
  multiple?: boolean;
  accept?: string;
}

interface FormComponentProps {
  columns: Column[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  showSubmitAtTop?: boolean;
  enableChangeDetection?: boolean;
  enableOnImageAddOnly?: boolean;
}

export const TForm = forwardRef(
  (
    {
      columns,
      initialValues = {},
      onSubmit,
      onCancel,
      loading = false,
      setValues,
      submitText = "Lưu",
      cancelText = "Hủy",
      showSubmitAtTop = false,
      enableChangeDetection = true,
      enableOnImageAddOnly = false,
    }: any,
    ref
  ) => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [filteredColumns, setFilteredColumns] = useState<Column[]>([]);
    const [initialFormValues, setInitialFormValues] = useState<Record<string, any>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // ✅ Thêm state cho async validation (chỉ warning)
    const [asyncWarnings, setAsyncWarnings] = useState<Record<string, string>>(
      {}
    );
    const [isValidating, setIsValidating] = useState<Record<string, boolean>>(
      {}
    );
    const debounceRefs = useRef<Record<string, NodeJS.Timeout>>({});
    useEffect(() => {
      const newFiltered = columns.filter(
        (column: any) => !column.condition || column.condition(formData)
      );
      setFilteredColumns(newFiltered);
    }, [formData, columns]);
    useEffect(() => {
      if (setValues) {
        setValues(formData);
      }
    }, [formData]);

    // ✅ Cleanup debounce timeouts on unmount
    useEffect(() => {
      return () => {
        Object.values(debounceRefs.current).forEach(timeout => {
          if (timeout) clearTimeout(timeout);
        });
      };
    }, []);
    // ✅ Track if form has been initialized to prevent reset during editing
    const [isFormInitialized, setIsFormInitialized] = useState(false);
    const [previousInitialValues, setPreviousInitialValues] =
      useState(initialValues);

    useEffect(() => {
      // Convert date strings to Dayjs objects for date fields
      const processedInitialValues = {...initialValues};
      columns.forEach((column: any) => {
        if (column.type === "date" && processedInitialValues[column.id]) {
          const dateValue = processedInitialValues[column.id];
          if (typeof dateValue === "string" && dateValue.trim()) {
            processedInitialValues[column.id] = dayjs(dateValue);
          }
        }
      });

      // ✅ Check if initialValues actually changed (not just reference)
      const hasInitialValuesChanged =
        JSON.stringify(processedInitialValues) !==
        JSON.stringify(previousInitialValues);

      // Set formData if form hasn't been initialized yet OR if initialValues actually changed
      if (!isFormInitialized || hasInitialValuesChanged) {
        setFormData(processedInitialValues);
        setIsFormInitialized(true);
        setPreviousInitialValues(processedInitialValues);
        setInitialFormValues(processedInitialValues);
      }
    }, [initialValues, columns, isFormInitialized, previousInitialValues]);

    // Detect changes in form data
    useEffect(() => {
      const hasFormChanges = Object.keys(formData).some(key => {
        const currentValue = formData[key];
        const initialValue = initialFormValues[key];
        
        // Handle arrays (like images)
        if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
          if (enableOnImageAddOnly) {
            // Only enable if adding new items (not removing)
            const hasNewItems = currentValue.length > initialValue.length;
            
            // Check if any current items are new (not in initial array)
            const hasNewContent = currentValue.some(item => {
              if (typeof item === 'object' && 'name' in item) {
                // This is a new File object (newly uploaded)
                return true;
              }
              return false;
            });
            
            return hasNewItems || hasNewContent;
          } else {
            // Normal behavior - enable for any change
            return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
          }
        }
        
        // Handle other types - enable for any change
        return currentValue !== initialValue;
      });
      
      setHasChanges(hasFormChanges);
    }, [formData, initialFormValues, enableOnImageAddOnly]);
    useImperativeHandle(ref, () => ({
      setFormData: (formData: any) => {
        // Convert date strings to Dayjs objects for date fields
        const processedFormData = {...formData};
        columns.forEach((column: any) => {
          if (column.type === "date" && processedFormData[column.id]) {
            const dateValue = processedFormData[column.id];
            if (typeof dateValue === "string" && dateValue.trim()) {
              processedFormData[column.id] = dayjs(dateValue);
            }
          }
        });
        setFormData(processedFormData);
        // ✅ Reset initialization state when manually setting form data
        setIsFormInitialized(true);
      },
      setFieldData: (field: any, value: any) => {},
      getFormData: () => {
        return formData;
      },
      validateForm: () => {
        if (validateForm()) {
          return formData;
        } else {
          return false;
        }
      },
      // ✅ Method to reset form when switching to different item
      resetForm: () => {
        setIsFormInitialized(false);
        setFormData({});
        setErrors({});
        setAsyncWarnings({});
      },
      // ✅ Method to trigger async validation for a specific field
      triggerAsyncValidation: (fieldId: string) => {
        const column = columns.find((col: any) => col.id === fieldId);
        if (column && formData[fieldId]) {
          handleAsyncValidation(column, formData[fieldId]);
        }
      },
    }));

    // ✅ Function để xử lý async validation (chỉ warning)
    const handleAsyncValidation = (column: Column, value: any) => {
      if (!column.asyncValidate || !value) {
        // Clear warning nếu không có value
        setAsyncWarnings(prev => ({
          ...prev,
          [column.id]: "",
        }));
        setIsValidating(prev => ({
          ...prev,
          [column.id]: false,
        }));
        return;
      }

      // Clear previous timeout
      if (debounceRefs.current[column.id]) {
        clearTimeout(debounceRefs.current[column.id]);
      }

      // Clear warning khi bắt đầu validation
      setAsyncWarnings(prev => ({
        ...prev,
        [column.id]: "",
      }));

      // Set debounce timeout
      const debounceMs = column.debounceMs || 500;
      debounceRefs.current[column.id] = setTimeout(async () => {
        setIsValidating(prev => ({
          ...prev,
          [column.id]: true,
        }));

        try {
          if (typeof value === "string") {
            value = value.toString().trim();
          }
          const warningMsg = await column.asyncValidate!(formData, value);

          // ✅ Chỉ xử lý warning, không block submit
          if (warningMsg) {
            setAsyncWarnings(prev => ({
              ...prev,
              [column.id]: warningMsg,
            }));
          } else {
            // Clear warning
            setAsyncWarnings(prev => ({
              ...prev,
              [column.id]: "",
            }));
          }
        } catch (error) {
          // Không hiển thị lỗi khi API fail, chỉ clear warning
          setAsyncWarnings(prev => ({
            ...prev,
            [column.id]: "",
          }));
        } finally {
          setIsValidating(prev => ({
            ...prev,
            [column.id]: false,
          }));
        }
      }, debounceMs);
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const {name, value} = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });

      if (errors[name]) {
        setErrors({...errors, [name]: ""});
      }

      // ✅ Trigger async validation nếu có
      const column = columns.find((col: any) => col.id === name);
      if (column) {
        handleAsyncValidation(column, value);
      }
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      filteredColumns.forEach(column => {
        // ✅ Bỏ qua required validation nếu có skipRequiredValidation
        if (
          column.required &&
          !column.skipRequiredValidation &&
          !formData[column.id]?.toString().trim()
        ) {
          newErrors[column.id] = `${column.label} không được để trống`;
        }

        if (column.type === "currency") {
          const value = formData[column.id];
          if (value < 0) newErrors[column.id] = "Số tiền không được là số âm ";
        }

        // ✅ Kiểm tra điều kiện validate custom
        if (column.validate) {
          const errorMsg = column.validate(formData);
          if (errorMsg) {
            newErrors[column.id] = errorMsg;
          }
        }
      });

      const hasConfirmPassword = columns.some(
        (col: any) => col.id === "confirm_password"
      );
      if (
        hasConfirmPassword &&
        formData["confirm_password"] !== formData["password"]
      ) {
        newErrors["confirm_password"] = "Mật khẩu xác nhận không khớp";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm() && onSubmit) {
        onSubmit(formData);
      }
    };

    // Render submit buttons
    const renderSubmitButtons = () => (
      <Box 
        sx={{
          mt: 3, 
          mb: 3, 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: 2
        }}
      >
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="contained"
            startIcon={<FaTimes />}
            disabled={loading}
            sx={{
              backgroundColor: "gray",
              textTransform: "none !important",
              fontFamily: "Be Vietnam Pro",
            }}
          >
            {cancelText}
          </Button>
        )}
        {onSubmit && (
          <Button
            variant="contained"
            type="submit"
            startIcon={loading ? <CircularProgress size={16} /> : <FaSave />}
            disabled={loading || (enableChangeDetection && !hasChanges)}
            sx={{
              backgroundColor: (enableChangeDetection && !hasChanges) ? "#ccc" : "#0A8DEE",
              textTransform: "none !important",
              fontFamily: "Be Vietnam Pro",
              "&:hover": {
                backgroundColor: (enableChangeDetection && !hasChanges) ? "#ccc" : "#0A8DEE",
              },
            }}
          >
            {loading ? "Đang lưu..." : submitText}
          </Button>
        )}
      </Box>
    );

    // ✅ Component để hiển thị warning với icon và màu vàng
    const WarningMessage = ({message}: {message: string}) => (
      <Box sx={{display: "flex", alignItems: "center", gap: 0.5, mt: 0.5}}>
        <Warning sx={{color: "#ff9800", fontSize: "16px"}} />
        <Typography
          variant="caption"
          sx={{
            color: "#ff9800",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {message}
        </Typography>
      </Box>
    );

    const formControl = (type: any, column: any) => {
      switch (type) {
        case "file":
          return (
            <FormControl fullWidth>
              <Typography
                variant="subtitle2"
                sx={{fontWeight: 500, mb: 0.5, fontSize: "0.85rem"}}
              >
                {column.label}
              </Typography>

              <Box
                sx={{
                  border: "2px dashed #90caf9",
                  borderRadius: "8px",
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#f5faff",
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                }}
                onClick={() => {
                  document.getElementById(`file-input-${column.id}`)?.click();
                }}
              >
                <input
                  id={`file-input-${column.id}`}
                  type="file"
                  accept={column.accept || "*"}
                  multiple={column.multiple || false}
                  style={{display: "none"}}
                  aria-label={`Upload file for ${column.label}`}
                  onChange={e => {
                    const files = e.target.files;
                    if (column.multiple) {
                      // Multiple files: accumulate with previously selected files
                      const fileArray = files ? Array.from(files) : [];
                      const previous = Array.isArray(formData[column.id])
                        ? (formData[column.id] as File[])
                        : [];
                      const merged = [...previous, ...fileArray];
                      setFormData({
                        ...formData,
                        [column.id]: merged,
                      });
                    } else {
                      // Single file
                      const file = files?.[0] || null;
                      setFormData({
                        ...formData,
                        [column.id]: file,
                      });
                    }

                    if (errors[column.id]) {
                      setErrors({...errors, [column.id]: ""});
                    }
                  }}
                />
                <Typography sx={{fontSize: 14, color: "#1976d2"}}>
                  📎 Nhấn vào đây để tải lên{" "}
                  {column.multiple ? "(có thể chọn nhiều file)" : ""}
                </Typography>
                {/* Selected files list moved outside */}
              </Box>

              {/* Selected files list (outside upload box), left-aligned */}
              {formData[column.id] && (
                <Box sx={{mt: 1, textAlign: "left"}}>
                  {Array.isArray(formData[column.id]) ? (
                    // Multiple files
                    formData[column.id].map((file: any, index: any) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.75,
                          px: 1,
                          py: 0.75,
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: "#2e7d32",
                            fontWeight: 500,
                            flex: 1,
                          }}
                        >
                          📎 {file.name}
                        </Typography>
                        <CloseIcon
                          sx={{
                            fontSize: 18,
                            color: "#d32f2f",
                            cursor: "pointer",
                            p: 0.25,
                            borderRadius: "50%",
                            "&:hover": {backgroundColor: "#ffebee"},
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            const list = Array.isArray(formData[column.id])
                              ? ([...formData[column.id]] as File[])
                              : [];
                            list.splice(index, 1);
                            setFormData({
                              ...formData,
                              [column.id]: list,
                            });
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    // Single file
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1,
                        py: 0.75,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#2e7d32",
                          fontWeight: 500,
                          flex: 1,
                        }}
                      >
                        📎 {formData[column.id]?.name}
                      </Typography>
                      <CloseIcon
                        sx={{
                          fontSize: 18,
                          color: "#d32f2f",
                          cursor: "pointer",
                          p: 0.25,
                          borderRadius: "50%",
                          "&:hover": {backgroundColor: "#ffebee"},
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            [column.id]: null,
                          });
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {errors[column.id] && (
                <Typography variant="caption" color="error">
                  {errors[column.id]}
                </Typography>
              )}
            </FormControl>
          );

        case "select-coupon":
          return (
            <FormControl fullWidth>
              <TSelectCustom
                label={column.label}
                value={formData[column.id] || ""}
                onChange={val =>
                  setFormData({
                    ...formData,
                    [column.id]: val,
                  })
                }
                options={column?.options}
                error={!!errors[column.id]}
                helperText={errors[column.id]}
              />
            </FormControl>
          );

        case "rating-star":
          return (
            <FormControl fullWidth sx={{mt: 1}}>
              <Typography
                variant="subtitle2"
                sx={{fontWeight: 500, mb: 0.5, fontSize: "0.85rem"}}
              >
                {column.label}
              </Typography>
              <TStarRating
                value={formData?.[column.id] || 0}
                onChange={val => {
                  setFormData({
                    ...formData,
                    [column.id]: val,
                  });
                }}
              />
              {errors[column.id] && (
                <Typography variant="caption" color="error">
                  {errors[column.id]}
                </Typography>
              )}
            </FormControl>
          );

        case "select":
          return (
            <FormControl fullWidth>
              <TAutoComplete
                label={column.label}
                options={column.options}
                onChange={(value: any) => {
                  const option = column.options?.find((i: any) => i.value === value);
                  const text = option?.label || "";
                  const _formData = {
                    ...formData,
                    [column.id]: value,
                    [column.id + "_text"]: text,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, value);
                  }
                }}
                disableClearable={column.disableClearable ?? false}
                error={!!errors[column.id]}
                initValue={formData[column?.id] ?? null}
              />
            </FormControl>
          );

        case "select-fetch":
          return (
            <TSelectFetch
              label={column.label}
              fetchOptions={column.fetchOptions}
              defaultOptions={column.defaultOptions}
              value={formData[column.id]}
              onChange={val => {
                setFormData({...formData, [column.id]: val});
              }}
              error={!!errors[column.id]}
              helperText={errors[column.id]}
              formValue={formData}
            />
          );

        case "select-dependent":
          return (
            <FormControl fullWidth>
              <TSelectDependent
                label={column.label}
                value={formData[column.id]}
                parentValue={formData[column.parentId ?? ""]}
                getOptionsFromParent={column.getOptionsFromParent}
                onChange={val => {
                  setFormData({...formData, [column.id]: val});
                }}
                error={!!errors[column.id]}
                helperText={errors[column.id]}
              />
            </FormControl>
          );

        case "date":
          return (
            <FormControl fullWidth>
              <TDatePicker
                value={formData?.[column.id]}
                label={column.label}
                onChange={value => {
                  let newValue = value;
                  let formattedValue: any = newValue;
                  if (typeof value === "string" && value) {
                    if (value.includes("/")) {
                      // DD/MM/YYYY
                      const [day, month, year] = value.split("/");
                      const d = dayjs(`${year}-${month}-${day}`);
                      formattedValue = d.isValid()
                        ? d.format("YYYY-MM-DD")
                        : null;
                    } else {
                      const d = dayjs(value);
                      formattedValue = d.isValid()
                        ? d.format("YYYY-MM-DD")
                        : null;
                    }
                  }
                  const _formData = {
                    ...formData,
                    [column.id]: formattedValue,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, formattedValue);
                  }
                }}
                format={column.format}
                error={!!errors[column.id]}
                helperText={errors[column.id] ?? ""}
              />
            </FormControl>
          );

        case "date-time":
          return (
            <FormControl fullWidth>
              <TDateTimePicker
                value={formData?.[column.id]}
                label={column.label}
                onChange={value => {
                  const _formData = {
                    ...formData,
                    [column.id]: value,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, value);
                  }
                }}
                error={!!errors[column.id]}
                helperText={errors[column.id] ?? ""}
              />
            </FormControl>
          );

        case "time":
          return (
            <FormControl fullWidth>
              <TTimePicker
                value={formData?.[column.id]}
                label={column.label}
                onChange={value =>
                  setFormData({
                    ...formData,
                    [column.id]: value,
                  })
                }
                error={!!errors[column.id]}
                helperText={errors[column.id] ?? ""}
              />
            </FormControl>
          );

        case "multi-select":
          return (
            <FormControl fullWidth>
              <TAutoComplete
                label={column.label}
                options={column.options}
                multiple={true}
                required={column.required}
                error={!!errors[column.id]}
                helperText={errors[column.id]}
                initValue={formData?.[column.id] ?? []}
                onChange={(value: any[]) => {
                  const _formData = {
                    ...formData,
                    [column.id]: value,
                  };

                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, value);
                  }
                }}
              />
            </FormControl>
          );

        case "switch":
          return (
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData?.[column.id] ?? false}
                    onChange={(e: any) => {
                      const value = Boolean(e.target.checked);
                      setFormData({
                        ...formData,
                        [column.id]: value,
                      });
                    }}
                  />
                }
                label={column.label}
              />
            </FormControl>
          );

        case "number":
          return (
            <FormControl fullWidth>
              <TTextField
                sx={{fontSize: "13px"}}
                fullWidth
                label={column.label}
                name={column.id}
                type="number"
                value={formData?.[column.id] || ""}
                onChange={(e: any) => {
                  const value = e.target.value;
                  const valueNumber = value === "" ? "" : Number(value);
                  const _formData = {
                    ...formData,
                    [column.id]: valueNumber,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    const result = column.onChange(_formData, valueNumber);
                    if (result && typeof result === "object") {
                      setFormData(result);
                    }
                  }
                }}
                variant="outlined"
                error={!!errors[column.id]}
                helperText={errors[column.id] ?? ""}
              />
            </FormControl>
          );

        case "label-fetch":
          return (
            <FormControl fullWidth>
              <TLabelFetch
                label={column.label}
                formValue={formData}
                fetchLabel={column.fetchLabel}
                callOnce={column.callOnce}
              />
            </FormControl>
          );

        case "label":
          return (
            <FormControl fullWidth>
              <Box sx={{px: 0, py: 0}}>
                <Typography variant="caption" color="textSecondary">
                  {column.label}
                </Typography>
                <Typography
                  sx={{fontSize: 15, fontWeight: 500, color: "black"}}
                >
                  {formData?.[column.id] ?? ""}
                </Typography>
              </Box>
            </FormControl>
          );

        case "tree-select":
          return (
            <FormControl fullWidth>
              <TTreeSelect
                label={column.label}
                onChange={(e: any) => {
                  const _formData = {
                    ...formData,
                    [column.id]: e,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, e);
                  }
                }}
                value={formData?.[column.id]}
                options={column.options}
                multiSelect={column.multiSelect || false}
                checkboxSelection={column.checkboxSelection || false}
                singleSelect={column.singleSelect || false}
              ></TTreeSelect>
            </FormControl>
          );
        case "custom":
          return (
            <FormControl fullWidth>
              {column.component && typeof column.component === 'function' && (
                <column.component
                  value={formData?.[column.id] || []}
                  onChange={(value: any) => {
                    const _formData = {
                      ...formData,
                      [column.id]: value,
                    };
                    setFormData(_formData);
                    if (column?.onChange) {
                      column.onChange(_formData, value);
                    }
                  }}
                  multiple={column.multiple}
                  accept={column.accept}
                  disabled={loading}
                  label={column.label}
                  // Truyền tất cả props từ column
                  {...column}
                />
              )}
            </FormControl>
          );
        case "year":
          return (
            <FormControl fullWidth>
              <TYearPicker
                value={formData?.[column.id]}
                label={column.label}
                onChange={value => {
                  const _formData = {
                    ...formData,
                    [column.id]: value,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, value);
                  }
                }}
                error={!!errors[column.id]}
                helperText={errors[column.id] ?? ""}
              />
            </FormControl>
          );
        case "select-multiple-fetch":
          return (
            <Box>
              <TSelectMultipleFetch
                label={column.label}
                fetchOptions={column.fetchOptions}
                value={formData?.[column.id] ?? []}
                onChange={val => {
                  const _formData = {
                    ...formData,
                    [column.id]: val,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, val);
                  }
                  // ✅ Trigger async validation
                  handleAsyncValidation(column, val);
                }}
                error={!!errors[column.id]}
                helperText={errors[column.id]}
                formValue={formData}
                showError={true}
              />
              {/* ✅ Hiển thị warning với icon và màu vàng */}
              {asyncWarnings[column.id] && (
                <WarningMessage message={asyncWarnings[column.id]} />
              )}
            </Box>
          );

        case "toggle-input":
          return (
            <Box>
              <ToggleInput
                label={column.label}
                value={
                  formData?.[column.id] || (column.isMultiSelect ? [] : "")
                }
                onChange={val => {
                  const _formData = {
                    ...formData,
                    [column.id]: val,
                  };
                  setFormData(_formData);
                  if (column?.onChange) {
                    column.onChange(_formData, val);
                  }
                  // ✅ Trigger async validation
                  handleAsyncValidation(column, val);
                }}
                error={!!errors[column.id]}
                helperText={errors[column.id]}
                required={column.required}
                options={column.toggleOptions || []}
                onSaveToCategory={column.onSaveToCategory}
                onSaveSuccess={column.onSaveSuccess}
                multiline={column.multiline}
                rows={column.rows}
                isEditMode={!!initialValues?._id} // ✅ Truyền thông tin edit mode
                isMultiSelect={column.isMultiSelect} // ✅ Truyền thông tin multi select
              />
              {/* ✅ Hiển thị warning với icon và màu vàng */}
              {asyncWarnings[column.id] && (
                <WarningMessage message={asyncWarnings[column.id]} />
              )}
            </Box>
          );

        case "color":
          return (
            <FormControl fullWidth>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 40,
                    borderRadius: 1,
                    border: "1px solid #ccc",
                    backgroundColor: formData?.[column.id] || "#495057",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    document.getElementById(`color-input-${column.id}`)?.click();
                  }}
                />
                <TTextField
                  sx={{fontSize: "13px", flex: 1}}
                  fullWidth
                  label={column.label}
                  name={column.id}
                  value={formData?.[column.id] || ""}
                  onChange={(e: any) => {
                    const value = e.target.value;
                    const _formData = {
                      ...formData,
                      [column.id]: value,
                    };
                    setFormData(_formData);
                    if (column?.onChange) {
                      column.onChange(_formData, value);
                    }
                  }}
                  variant="outlined"
                  error={!!errors[column.id]}
                  helperText={errors[column.id] ?? ""}
                />
                <input
                  id={`color-input-${column.id}`}
                  type="color"
                  value={formData?.[column.id] || "#495057"}
                  onChange={e => {
                    const value = e.target.value;
                    const _formData = {
                      ...formData,
                      [column.id]: value,
                    };
                    setFormData(_formData);
                    if (column?.onChange) {
                      column.onChange(_formData, value);
                    }
                  }}
                  style={{ display: "none" }}
                />
              </Box>
            </FormControl>
          );

        default:
          return (
            <Box>
              <FormControl fullWidth>
                <TTextField
                  sx={{fontSize: "13px"}}
                  fullWidth
                  label={column.label}
                  name={column.id}
                  type={column.type}
                  value={formData?.[column.id] || ""}
                  onChange={(e: any) => {
                    const value = e.target.value;
                    const _formData = {
                      ...formData,
                      [column.id]: value,
                    };
                    setFormData(_formData);
                    if (column?.onChange) {
                      column.onChange(_formData, value);
                    }
                    // ✅ Trigger async validation
                    handleAsyncValidation(column, value);
                  }}
                  variant="outlined"
                  multiline={column.type === "textarea"}
                  minRows={column.type === "textarea" ? 3 : 1}
                  error={!!errors[column.id]}
                  helperText={errors[column.id] || ""}
                  // ✅ Thêm loading indicator
                  InputProps={{
                    endAdornment: isValidating[column.id] ? (
                      <CircularProgress size={20} />
                    ) : null,
                  }}
                />
              </FormControl>
              {/* ✅ Hiển thị warning với icon và màu vàng */}
              {asyncWarnings[column.id] && (
                <WarningMessage message={asyncWarnings[column.id]} />
              )}
            </Box>
          );
      }
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          paddingTop: "10px",
          paddingBottom: "10px",
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        {/* Show submit buttons at top if showSubmitAtTop is true */}
        {showSubmitAtTop && renderSubmitButtons()}
        
        <Grid container spacing={2}>
          {filteredColumns
            .filter(e => !e?.hidden)
            .map((column, index) => {
              return (
                <Grid key={index} size={column?.size ?? {xs: 24, md: 24}}>
                  {formControl(column.type, column)}
                </Grid>
              );
            })}
        </Grid>
        
        {/* Show submit buttons at bottom if showSubmitAtTop is false */}
        {!showSubmitAtTop && renderSubmitButtons()}
      </Box>
    );
  }
);
