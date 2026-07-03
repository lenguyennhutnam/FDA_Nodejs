import React, { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { FaStar } from "react-icons/fa";

interface TStarRatingProps {
  value?: number; // giá trị hiện tại
  onChange: (value: number) => void; // callback khi người dùng chọn sao
  size?: number; // kích thước ngôi sao
  color?: string; // màu ngôi sao được chọn
}

export const TStarRating: React.FC<TStarRatingProps> = ({
  value = 0,
  onChange,
  size = 24,
  color = "#FFC107",
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <IconButton
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          size="small"
          sx={{ p: 0.5 }}
        >
          <FaStar
            size={size}
            color={star <= (hovered ?? value) ? color : "#E0E0E0"}
          />
        </IconButton>
      ))}
    </Box>
  );
};
