import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { IoClose } from "react-icons/io5";

function isImageFile(url: string): boolean {
  return /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(url);
}

function isPDFFile(url: string): boolean {
  return /\.pdf$/i.test(url);
}

export const TModalViewFile = ({
  open,
  onClose,
  fileUrl,
  title = "Xem hợp đồng",
  name = "a.pdf",
}: {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
  name?: string;
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        {title}
        <IconButton onClick={onClose}>
          <IoClose />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {isImageFile(name) ? (
          <Box
            component="img"
            src={fileUrl}
            alt="File"
            sx={{
              width: "100%",
              maxHeight: "600px",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        ) : isPDFFile(name) ? (
          <iframe
            src={fileUrl}
            title="PDF Viewer"
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
        ) : (
          <Typography color="error">
            Không hỗ trợ hiển thị định dạng file này.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
