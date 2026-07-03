import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SendIcon from "@mui/icons-material/Send";

export interface RawMessage {
  _id: string;
  tin_nhan: string;
  created_date: number;
  nguoi_gui: string;
  chi_tiet_nguoi_gui?: { ho_ten: string };
}

interface RawInfo {
  lop_hoc: { ten: string };
  hoc_sinh: { ho_ten: string };
}

export interface TChatProps {
  messages: RawMessage[];
  info?: RawInfo;
  onLoadMore: () => void;
  onSend: (content: string) => void;
  loading: boolean;
  currentUserId: string;
}

export const TChat: React.FC<TChatProps> = ({
  messages: messagesFromApi,
  onLoadMore,
  onSend,
  loading,
  currentUserId,
  info,
}) => {
  const [input, setInput] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => {
    return messagesFromApi.map((msg) => ({
      _id: msg._id,
      content: msg.tin_nhan,
      created_date: msg.created_date,
      from_me: msg.nguoi_gui === currentUserId,
      sender_name: msg.chi_tiet_nguoi_gui?.ho_ten,
    }));
  }, [messagesFromApi, currentUserId]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await onLoadMore();
    setIsLoadingMore(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        backgroundColor: "white",
        fontFamily: `'Be Vietnam Pro', sans-serif`,
        width: "100%",
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
        <Typography variant="h6" fontWeight={600}>
          {info?.lop_hoc?.ten || "Sổ liên lạc"}
        </Typography>
        {info?.hoc_sinh?.ho_ten && (
          <Typography sx={{ fontSize: 13, color: "gray" }}>
            Học sinh: {info.hoc_sinh.ho_ten}
          </Typography>
        )}
      </Box>

      {/* Message List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          py: 1,
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <div ref={bottomRef} />

        <>
          <Button
            startIcon={<ArrowUpwardIcon />}
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            size="small"
            sx={{ alignSelf: "center", mb: 1 }}
          >
            {isLoadingMore ? "Đang tải..." : "Tải thêm tin nhắn"}
          </Button>

          {[...messages].map((msg) => (
            <Box
              key={msg._id}
              sx={{
                alignSelf: msg.from_me ? "flex-end" : "flex-start",
                bgcolor: msg.from_me ? "#E0F2FE" : "#F3F4F6",
                px: 2,
                py: 1,
                borderRadius: 2,
                mb: 1,
                maxWidth: "75%",
              }}
            >
              {!msg.from_me && msg.sender_name && (
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>
                  {msg.sender_name}
                </Typography>
              )}
              <Typography sx={{ fontSize: 14 }}>{msg.content}</Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  mt: 0.5,
                  color: "gray",
                  textAlign: "right",
                }}
              >
                {new Date(msg.created_date).toLocaleTimeString()}
              </Typography>
            </Box>
          ))}
        </>
      </Box>

      {/* Input */}
      <Box sx={{ display: "flex", p: 1, borderTop: "1px solid #e0e0e0" }}>
        <TextField
          fullWidth
          size="small"
          value={input}
          placeholder="Nhập tin nhắn..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
