import {Divider, Typography} from "antd";
import React from "react";
import "./style.scss";
type Props = {
  title: string;
  style?: any;
};
const TitleReceipt = (props: Props) => {
  const {title, style} = props;
  return (
    <div className="title-receipt" style={style}>
      <div style={{fontWeight: 600}}>{title}</div>
      <div style={{display: "flex", justifyContent: "center", width: "4cm"}}>
        <Divider type="horizontal"></Divider>
      </div>
    </div>
  );
};
export {TitleReceipt};
