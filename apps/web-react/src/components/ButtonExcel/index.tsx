import { Button } from "antd";
import { FaFileExcel } from "react-icons/fa";
import "./ButtonExcel.scss";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
};

const ButtonExcel = (props: Props) => {
  const { onClick, disabled } = props;
  return (
    <Button 
      className="btn-excel" 
      onClick={onClick} 
      disabled={disabled}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      <FaFileExcel style={{ color: '#1f7244', fontSize: '14px' }} />
      Xuất báo cáo
    </Button>
  );
};

export { ButtonExcel };
