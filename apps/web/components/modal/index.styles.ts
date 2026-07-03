import {height, margin, maxHeight, maxWidth} from "@mui/system";

export const modalStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "auto",
  maxWidth: "calc(100vw)",
};

export const containerStyle = {
  margin: "auto",
  minWidth: "300px",
  display: "flex",
  flexDirection: "column",
  padding: "24px 24px 24px 24px",
  alignItems: "flex-start",
  gap: "16px",
  background: "#F0F7FC",
  border: "none",
  borderRadius: "12px",
  maxWidth: "calc(100% - 200px)",
  maxHeight: "calc(100vh - 80px)",
  boxShadow:
    "0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)",
  outline: "none",
};
export const contentStyle = {
  overflow: "auto",
  width: "100%",
};
export const topModalStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

export const titleStyle = {
  color: "#101828",
  fontSize: "18px",
  fontStyle: "normal",
  fontWeight: "600",
  lineHeight: "28px",
  fontFamily: "Be Vietnam Pro",
};
