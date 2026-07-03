import { Form, Input, InputRef } from "antd";
import { useEffect, useRef, useState } from "react";
import "./style.scss";
import { isValuableString } from "../../../utils/check";
import { fieldType } from "../../../types";

const { INPUT } = fieldType;
const FormItemReceipt = (props) => {
  const { type, dataIndex, form } = props;
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const [value, setValue] = useState(null);
  let formItem = <></>;
  const toggleEdit = () => {
    setEditing(!editing);
  };
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const save = () => {
    toggleEdit();
    setValue(form.getFieldValue(dataIndex));
  };
  if (type == INPUT) {
    formItem = (
      <Form.Item name={dataIndex}>
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    );
  }
  const renderValue = (
    <span
      className="editable-cell-value-wrap"
      style={{ paddingRight: 24 }}
      onClick={toggleEdit}
    >
      {value && isValuableString(value) ? value : "........."}
    </span>
  );

  return (
    <div className="form-item-receipt">
      <div style={{ display: `${editing ? "block" : "none"}` }}>{formItem}</div>
      <div style={{ display: `${editing ? "none" : "block"}` }}>
        {renderValue}
      </div>
    </div>
  );
};
export { FormItemReceipt };
