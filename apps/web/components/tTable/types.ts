export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  sticky?: "right" | "left";
  align?: "left" | "right" | "center";
  wordWrap?: boolean; // Cho phép text xuống dòng
  maxLines?: number; // Số dòng tối đa hiển thị, nếu dư text thì cắt và thêm "..."
  maxWidth?: number; // Chiều rộng tối đa của cell (px)
}

export interface Data {
  [key: string]: any;
  style?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: number | string;
  };
}
