import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

type Props = {
  label: string;
  fetchLabel: (formData: Record<string, any>) => Promise<string>;
  formValue: Record<string, any>;
  callOnce?: boolean;
};

export const TLabelFetch: React.FC<Props> = ({
  label,
  fetchLabel,
  formValue,
  callOnce = false,
}) => {
  const [value, setValue] = useState<string>("");
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (callOnce && fetched) return;

    const fetch = async () => {
      try {
        const res = await fetchLabel(formValue);
        if (isMounted) {
          setValue(res);
          setFetched(true);
        }
      } catch (err) {
        console.error(`Error fetching ${label}:`, err);
      }
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, [formValue, fetchLabel, label, callOnce, fetched]); // ✅ thêm `label` vào dependency

  if (value === "") return null;

  return (
    <Box sx={{ px: 0, py: 0 }}>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 500, color: "black" }}>
        {value}
      </Typography>
    </Box>
  );
};
