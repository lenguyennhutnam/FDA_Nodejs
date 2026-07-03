import { Box, Grow, Modal, SxProps, Theme } from "@mui/material";

import * as styles from "./index.styles";
import { FaTimes } from "react-icons/fa";

export * from "./modal-confirm";

type ModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
  containerStyle?: SxProps<Theme>;
};

export const ModalComponent: React.FC<ModalProps> = ({
  visible,
  title,
  onClose,
  children,
  containerStyle,
}) => {
  return (
    <Modal open={visible} onClose={onClose} sx={styles.modalStyle}>
      <Grow in={visible}>
        <Box sx={styles.containerStyle}>
          <Box sx={styles.topModalStyle}>
            <Box sx={styles.titleStyle}>{title}</Box>
            <FaTimes onClick={onClose} style={{ cursor: "pointer" }} />
          </Box>
          <Box sx={{ ...styles.contentStyle, ...(containerStyle || {}) }}>
            {children}
          </Box>
        </Box>
      </Grow>
    </Modal>
  );
};
