export const searchInput = {
  width: "100%",
  maxWidth: "300px", // 🔹 Thu nhỏ chiều rộng
  borderRadius: "6px",
  backgroundColor: "#fff",
  fontSize: "0.875rem", // 🔹 Chữ nhỏ hơn
  "& .MuiOutlinedInput-root": {
    height: "36px", // 🔹 Giảm chiều cao input
    borderRadius: "6px",
    boxShadow: "none",
    "& .MuiOutlinedInput-input": {
      padding: "8px 10px", // 🔹 Thu gọn khoảng padding bên trong
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
      boxShadow: "none",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
};

export const icon = {
  color: "#1976d2",
  fontSize: "18px", // 🔹 Thu nhỏ icon
};
