import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import {useEffect, useState} from "react";
import {FaEdit, FaList} from "react-icons/fa";
import {TAutoComplete} from "../tAutoComplete";
import {TShowConfirm} from "../tShowConfirm";
import {styles} from "./index.styles";

interface ToggleInputProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  options: Array<{value: string; label: string}>;
  onSaveToCategory?: (value: string) => Promise<void>;
  onSaveSuccess?: () => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  isEditMode?: boolean; // Thêm prop để biết khi nào đang ở chế độ edit
  isMultiSelect?: boolean; // Thêm prop để hỗ trợ multi select
}

export const ToggleInput = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  options = [],
  onSaveToCategory,
  onSaveSuccess,
  placeholder,
  multiline = false,
  rows = 3,
  isEditMode = false,
  isMultiSelect = false,
}: ToggleInputProps) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [tempValue, setTempValue] = useState(() => {
    if (isMultiSelect) {
      // Nếu là multi select và value là array, giữ nguyên
      if (Array.isArray(value)) {
        return value;
      }
      // Nếu là multi select nhưng value là string, chuyển thành string để gõ text tự do
      return value || "";
    }
    return value;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [userHasManuallyToggled, setUserHasManuallyToggled] = useState(false); // ✅ Track việc người dùng đã thao tác thủ công
  const [hasError, setHasError] = useState(error); // ✅ Track error state nội bộ

  useEffect(() => {
    // ✅ Only update tempValue if it's different from current value
    // This prevents unnecessary resets during user input
    let newTempValue;
    if (isMultiSelect) {
      if (Array.isArray(value)) {
        newTempValue = value;
      } else {
        // Nếu là multi select nhưng value là string, giữ nguyên string để gõ text tự do
        newTempValue = value || "";
      }
    } else {
      newTempValue = value;
    }

    if (JSON.stringify(tempValue) !== JSON.stringify(newTempValue)) {
      setTempValue(newTempValue);
      // ✅ Reset manual toggle state khi value thay đổi (khi edit item khác)
      setUserHasManuallyToggled(false);
    }
  }, [value, tempValue, isMultiSelect]);

  // ✅ Logic tự động chuyển sang text mode khi giá trị không có trong options (chỉ trong chế độ edit)
  useEffect(() => {
    if (isEditMode && value && !userHasManuallyToggled) {
      let valueExistsInOptions = false;

      if (isMultiSelect && Array.isArray(value)) {
        // Kiểm tra cho multi select
        valueExistsInOptions = value.every(val =>
          options.some(option => option.value === val || option.label === val)
        );
      } else if (!isMultiSelect && typeof value === "string" && value.trim()) {
        // Kiểm tra cho single select
        valueExistsInOptions = options.some(option => {
          // So sánh với cả value và label
          if (option.value === value || option.label === value) {
            return true;
          }

          // Đặc biệt cho trường chu_tri: có thể lưu tên người dùng thay vì _id
          if (label === "Chủ trì" && option.label) {
            // Kiểm tra xem value có chứa tên người dùng không
            const userName = option.label.split(" - ")[0]; // Lấy phần tên trước dấu -
            if (userName && value.includes(userName.trim())) {
              return true;
            }
          }

          return false;
        });
      }

      // Nếu giá trị không có trong options và đang ở select mode, chuyển sang text mode
      if (!valueExistsInOptions && isSelectMode) {
        setIsSelectMode(false);
      }
    }
  }, [
    value,
    options,
    isEditMode,
    isSelectMode,
    userHasManuallyToggled,
    label,
    isMultiSelect,
  ]);

  const handleModeToggle = () => {
    setUserHasManuallyToggled(true); // ✅ Đánh dấu người dùng đã thao tác thủ công
    setIsSelectMode(!isSelectMode);

    // ✅ Không xóa text khi chuyển đổi mode để giữ nguyên nội dung người dùng đã gõ
    if (!isSelectMode) {
      // Nếu chuyển từ text mode sang select mode thì giữ nguyên giá trị
      setTempValue(value);
    }
  };

  const handleSaveToCategory = () => {
    if (!onSaveToCategory) return;
    const valueToSave = isMultiSelect
      ? Array.isArray(tempValue)
        ? tempValue.join(", ")
        : tempValue
      : tempValue;
    if (
      !valueToSave ||
      (typeof valueToSave === "string" && !valueToSave.trim())
    )
      return;
    setShowConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    if (!onSaveToCategory) return;
    const valueToSave = isMultiSelect
      ? Array.isArray(tempValue)
        ? tempValue.join(", ")
        : tempValue
      : tempValue;
    if (
      !valueToSave ||
      (typeof valueToSave === "string" && !valueToSave.trim())
    )
      return;

    try {
      setIsSaving(true);
      await onSaveToCategory(
        typeof valueToSave === "string"
          ? valueToSave.trim()
          : String(valueToSave)
      );
      // Call success callback to refresh options
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      setShowConfirmSave(false);
    } catch (error) {
      console.error("Error saving to category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleValueChange = (newValue: string | string[]) => {
    setTempValue(newValue);
    onChange(newValue);

    // ✅ Validate giá trị và update error state
    if (required) {
      if (isMultiSelect) {
        // Với multi select, check nếu có ít nhất 1 giá trị
        const hasValue = Array.isArray(newValue)
          ? newValue.length > 0
          : !!newValue;
        if (hasValue && hasError) {
          setHasError(false);
        } else if (!hasValue && !hasError) {
          setHasError(true);
        }
      } else {
        // Với single value, check nếu có giá trị
        const isValid = newValue && String(newValue).trim();
        console.log(
          "📝 Single value, isValid:",
          isValid,
          "value:",
          newValue,
          "hasError:",
          hasError
        );
        if (isValid && hasError) {
          console.log("✅ Clearing error (single value)");
          setHasError(false);
        } else if (!isValid && !hasError) {
          console.log("❌ Setting error (single value - empty)");
          setHasError(true);
        }
      }
    }
  };

  const TextFieldAny = TextField as any;

  return (
    <FormControl fullWidth error={hasError} required={required} sx={{mt: -0.5}}>
      <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 0}}>
        <FormLabel
          sx={{
            flex: 1,
            fontSize: "0.875rem",
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {label}
          {required && <span style={styles.requiredAsterisk}> *</span>}
        </FormLabel>

        <Tooltip
          title={isSelectMode ? "Chuyển sang nhập text" : "Chọn từ danh mục"}
        >
          <IconButton
            size="small"
            onClick={handleModeToggle}
            sx={{
              color: isSelectMode ? "#0A8DEE" : "#666",
              padding: "4px",
              "&:hover": {
                backgroundColor: isSelectMode ? "#0A8DEE20" : "#f5f5f5",
              },
            }}
          >
            {isSelectMode ? <FaEdit /> : <FaList />}
          </IconButton>
        </Tooltip>

        {/* {!isSelectMode && onSaveToCategory && tempValue.trim() && (
          <Tooltip title="Lưu vào danh mục">
            <IconButton
              size="small"
              onClick={handleSaveToCategory}
              disabled={isSaving}
              sx={{
                color: "#28a745",
                "&:hover": {
                  backgroundColor: "#28a74520",
                },
                "&:disabled": {
                  color: "#ccc",
                },
              }}
            >
              <FaSave />
            </IconButton>
          </Tooltip>
        )} */}
      </Box>

      {isSelectMode ? (
        <>
          <TAutoComplete
            label={label}
            value={tempValue}
            onChange={newValue => {
              handleValueChange(newValue);
            }}
            options={options}
            error={hasError}
            helperText={hasError ? helperText : ""}
            showError={hasError}
            required={required}
            multiple={isMultiSelect}
          />
        </>
      ) : (
        <>
          <TextFieldAny
            value={
              isMultiSelect && isSelectMode
                ? Array.isArray(tempValue)
                  ? tempValue.join(", ")
                  : tempValue
                : tempValue
            }
            onChange={(e: any) => {
              if (isMultiSelect && isSelectMode) {
                // Chỉ parse comma-separated values khi ở select mode
                const values = e.target.value
                  .split(",")
                  .map((v: string) => v.trim())
                  .filter((v: string) => v);
                handleValueChange(values);
              } else {
                handleValueChange(e.target.value);
              }
            }}
            placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
            error={hasError}
            multiline={multiline}
            rows={multiline ? rows : 1}
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              fontFamily:
                '"BeVietnamPro", "Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
              "& .MuiInputBase-input": {
                fontFamily:
                  '"BeVietnamPro", "Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
              },
              "& .MuiInputBase-input::placeholder": {
                fontFamily:
                  '"BeVietnamPro", "Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
              },
              // Fallback to avoid top border notch gap when no label
              "& fieldset legend": {
                width: 0,
              },
            }}
            InputProps={{notched: false}}
          />
          {hasError && helperText && (
            <FormHelperText error sx={{mt: 0.5}}>
              {helperText}
            </FormHelperText>
          )}
        </>
      )}

      <TShowConfirm
        visible={showConfirmSave}
        title="Xác nhận lưu"
        message={`Bạn có chắc chắn muốn lưu "${tempValue}" vào danh mục ${label.toLowerCase()} không?`}
        onConfirm={handleConfirmSave}
        onClose={() => setShowConfirmSave(false)}
        onCancel={() => setShowConfirmSave(false)}
      />
    </FormControl>
  );
};
