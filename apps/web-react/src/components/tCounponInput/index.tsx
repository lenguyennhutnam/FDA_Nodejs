import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { formatNumberVND } from "../../utils/common";
import { LocalOffer, Close, Error } from "@mui/icons-material";
import { RiCoupon2Line } from "react-icons/ri";

type CouponInfo = {
  loai: string;
  giam?: number;
  giam_phan_tram?: number;
  valid: boolean;
  message?: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  fetchCouponInfo: (ma: string) => Promise<CouponInfo>;
  error?: boolean;
  helperText?: string;
  onChangeInfo?: (info: CouponInfo | null) => void; // ✅ mới thêm
  info?: CouponInfo | null;
};

const CouponCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  background: "#F0F7FF",
  border: "1px dashed #0A8DEE",
  borderRadius: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  maxWidth: "100%",
}));

export const TCouponInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  fetchCouponInfo,
  error,
  helperText,
  onChangeInfo,
  info,
}) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string>(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleVerify = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetchCouponInfo(text);
     
      if (res.valid) {
        onChange(text);
        onChangeInfo?.(res); // ✅ thông báo info kể cả hợp lệ hay không
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setText("");
    onChangeInfo?.(null); // ✅ thông báo clear info
  };

  if (!!info?.valid && value) {
    return (
      <CouponCard elevation={0}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <RiCoupon2Line size={20} color="#0A8DEE" />
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "#0A8DEE",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              Mã giảm giá
            </Typography>
            <Typography
              sx={{
                color: "#333",
                fontSize: "0.875rem",
                fontWeight: 600,
                my: 0.25,
              }}
            >
              {value.toUpperCase()}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                fontSize: "0.75rem",
              }}
            >
              {info.loai === "giam_phan_tram"
                ? `Giảm ${info.giam_phan_tram}%`
                : `Giảm ${formatNumberVND(info.giam as number)} VNĐ`}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClear}
          size="small"
          sx={{
            color: "#666",
            "&:hover": {
              background: "rgba(0,0,0,0.05)",
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </CouponCard>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          label={label}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChangeInfo?.(null); // ✅ reset info khi sửa mã
          }}
          error={error}
          helperText={helperText}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalOffer color="primary" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={loading || !text.trim()}
          startIcon={<RiCoupon2Line />}
          sx={{
            backgroundColor: "#0A8DEE",
            textTransform: "none !important",
            width: "150px",
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Áp dụng"}
        </Button>
      </Box>

      {info && !info.valid && (
        <Fade in={true}>
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: "error.lighter",
              color: "error.dark",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Error color="error" />
            <Typography>{info.message || "Mã không hợp lệ"}</Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};
