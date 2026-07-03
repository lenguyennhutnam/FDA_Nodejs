import React from "react";
import { Box, Typography } from "@mui/material";
import { RiCoupon2Line } from "react-icons/ri";
import { formatNumberVND } from "../../utils/common";

interface TCouponCardProps {
  loai: string;
  giam?: number;
  giam_phan_tram?: number;
  code: string;
}

const TCouponCard: React.FC<TCouponCardProps> = ({
  loai,
  giam,
  giam_phan_tram,
  code,
}) => {
  return (
    <Box
      sx={{
        padding: 2,
        background: "#F0F7FF",
        border: "1px dashed #0A8DEE",
        borderRadius: 1,
        width: "95%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <RiCoupon2Line size={20} color="#0A8DEE" />
        <Box>
          {/* <Typography
            variant="body2"
            sx={{ color: "#0A8DEE", fontSize: "0.75rem", fontWeight: 500 }}
          >
            Mã giảm giá
          </Typography> */}
          <Typography
            sx={{
              color: "#333",
              fontSize: "0.875rem",
              fontWeight: 600,
              my: 0.25,
            }}
          >
            {code.toUpperCase()}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#666", fontSize: "0.75rem" }}
          >
            {loai === "giam_phan_tram"
              ? `Giảm ${giam_phan_tram}%`
              : `Giảm ${formatNumberVND(giam as number)} VNĐ`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TCouponCard;
