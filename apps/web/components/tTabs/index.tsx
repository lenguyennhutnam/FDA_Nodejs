import * as React from "react";
import {styled} from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab, {TabProps} from "@mui/material/Tab";
import Box from "@mui/material/Box";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TTabPanel(props: TabPanelProps) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {<Box sx={{p: 3}}>{children}</Box>}
    </div>
  );
}

const TTab = styled((props: TabProps & any) => (
  <Tab disableRipple {...props} />
))(({theme}) => ({
  textTransform: "none",
  minWidth: 0,
  [theme.breakpoints.up("sm")]: {
    minWidth: 0,
  },
  opacity: 0.7,
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(1),
  color: "rgba(0, 0, 0, 0.85)",
  "&.Mui-selected": {
    opacity: 1,
  },
  "&.Mui-focusVisible": {
    backgroundColor: "#d1eaff",
  },
}));

const TTabs = (props: any) => {
  const {children, panels, onChange, ...others} = props;
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Box sx={{width: "100%"}}>
      <Box sx={{borderBottom: 1, borderColor: "divider"}}>
        <Tabs
          value={value}
          onChange={(e: any, value: any) => {
            onChange(value);
            handleChange(e, value);
          }}
          aria-label="basic tabs example"
          {...others}
        >
          {children.map((e: any) => e)}
        </Tabs>
      </Box>

      {children?.map((e: any, index: any) => (
        <TTabPanel index={index} value={value}>
          <>{e?.props?.children}</>
        </TTabPanel>
      ))}
    </Box>
  );
};

export {TTabs, TTab, TTabPanel};
