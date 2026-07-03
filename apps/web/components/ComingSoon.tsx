import React from "react";
import { Box, Typography, useTheme, Paper } from "@mui/material";
import { FaRegClock } from "react-icons/fa";
import comingSoonImg from "../assets/images/coming-soon.png";

const subTexts = [
  "Tính năng này đang được phát triển...",
  "Chúng tôi đang nỗ lực hoàn thiện!",
  "Hãy quay lại sau để trải nghiệm nhé!",
];

const ComingSoon: React.FC = () => {
  const [subIndex, setSubIndex] = React.useState(0);
  const theme = useTheme();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSubIndex((prev) => (prev + 1) % subTexts.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 6, md: 8 },
          py: { xs: 3, sm: 5, md: 6 },
          borderRadius: 6,
          maxWidth: "1000px",
          width: "100%",
          gap: { xs: 3, md: 6 },
          height: "100%",
        }}
      >
        {/* Left: Image */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <img
            src={comingSoonImg}
            alt="Coming soon illustration"
            style={{
              width: "440px",
              maxWidth: "100%",
              height: "auto",
              borderRadius: 24,
              boxShadow: "0 4px 24px 0 #a5b4fc22",
              objectFit: "contain",
              background: "#fff",
              margin: "0 auto",
            }}
          />
        </Box>
        {/* Right: Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              fontSize: { xs: 48, sm: 64 },
              mb: 1,
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "glow 2.5s infinite alternate",
            }}
          >
            <FaRegClock />
          </Box>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              color: "#222",
              letterSpacing: 1,
              textShadow: "0 2px 16px #a5b4fc33, 0 1px 0 #fff",
              mb: 1,
              fontSize: { xs: 28, sm: 36, md: 44 },
            }}
            gutterBottom
          >
            Coming Soon
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.mode === "dark" ? "#cbd5e1" : "#444",
              mb: 1,
              fontWeight: 500,
              fontSize: { xs: 15, sm: 18 },
              minHeight: 28,
              transition: "all 0.5s cubic-bezier(.4,2,.6,1)",
            }}
            key={subIndex}
          >
            {subTexts[subIndex]}
          </Typography>
        </Box>
      </Box>
      <style>{`
        @keyframes glow {
          0% { filter: drop-shadow(0 0 8px #a5b4fc); }
          100% { filter: drop-shadow(0 0 32px #38bdf8); }
        }
      `}</style>
    </Box>
  );
};

export default ComingSoon;
