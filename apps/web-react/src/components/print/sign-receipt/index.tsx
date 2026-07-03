import {Row, Typography} from "antd";
import React from "react";
type Props = {
  title: string;
  name?: string;
};
const SignReceipt = (props: Props) => {
  const {title, name} = props;
  return (
    <div className="sign-receipt">
      <Row justify="center" style={{marginBottom: 70}}>
        <Typography.Text
          strong
          style={{
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "pre-line",
            display: "block",
            width: "100%",
          }}
        >
          {title}
        </Typography.Text>
      </Row>

      <Row justify={"center"}>
        {name && name.trim() !== "" ? name : "..................."}
      </Row>
    </div>
  );
};
export {SignReceipt};
