import {Component, ErrorInfo, ReactNode} from "react";
import {Box, Button, Typography} from "@mui/material";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            p: 3,
          }}
        >
          <Typography variant="h5">Đã xảy ra lỗi</Typography>
          <Typography color="text.secondary">
            Vui lòng tải lại trang hoặc thử lại sau.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
