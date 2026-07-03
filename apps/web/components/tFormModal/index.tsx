import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { TForm } from "../tForm";
import { Column } from "../tTable/types";

interface TFormModalProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  customTitle?: string;
  width?: number;
  values?: any;
  setValues?: any;
  loading?: boolean;
  loadingText?: string;
}

export const TFormModal = forwardRef(
  (
    {
      open,
      onClose,
      columns,
      initialValues = {},
      onSubmit,
      customTitle = "",
      width = 650,
      values,
      setValues,
      loading = false,
      loadingText = "Đang lưu...",
    }: TFormModalProps,
    ref
  ) => {
    const modalFormRef = useRef<any>(null);
    const handleSubmit = (values: Record<string, any>) => {
      onSubmit(values);
      // Don't automatically close modal - let parent handle it
    };
    useImperativeHandle(ref, () => ({
      setFormData: (formData: any) => {
        modalFormRef?.current?.setFormData(formData);
      },
      getFormData: () => {
        return modalFormRef?.current?.getFormData();
      },
    }));
    const DialogAny = Dialog as any;
    return (
      <DialogAny
        open={open}
        onClose={loading ? undefined : onClose} // Disable close when loading
        fullWidth
        maxWidth={"sm"}
        PaperProps={{
          sx: {
            width: width, // hoặc '90%', '60vw',
            maxWidth: "unset", // bỏ giới hạn mặc định
          },
        }}
      >
        {customTitle !== "" ? (
          <DialogTitle>{loading ? loadingText : customTitle}</DialogTitle>
        ) : (
          <DialogTitle>
            {loading
              ? loadingText
              : initialValues?._id
              ? "Sửa thông tin"
              : "Thêm mới"}
          </DialogTitle>
        )}

        <DialogContent>
          <TForm
            ref={modalFormRef}
            columns={columns}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            setValues={setValues}
            onCancel={loading ? undefined : onClose} // Disable cancel when loading
            loading={loading}
          />
        </DialogContent>
      </DialogAny>
    );
  }
);
