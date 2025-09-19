import { Form, InputNumber } from "antd";
import { FormItemProps } from "antd/es/form";
import { InputNumberProps } from "antd/es/input-number";

interface FormNumberWrapperProps extends FormItemProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  addonAfter?: React.ReactNode;
  addonBefore?: React.ReactNode;
  defaultValue?: number;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

const FormNumberWrapper: React.FC<FormNumberWrapperProps> = ({
  id,
  name,
  label,
  required,
  disabled,
  min,
  max,
  addonAfter,
  addonBefore,
  defaultValue,
  placeholder,
  style,
  className,
  ...rest
}) => {
  const inputNumberProps: InputNumberProps = {
    min,
    max,
    addonAfter,
    addonBefore,
    disabled,
    placeholder,
    style: { width: "100%", ...style },
    className,
  };

  return (
    <Form.Item
      label={label}
      name={name}
      rules={rest.rules}
      required={required}
      {...rest}
    >
      <InputNumber {...inputNumberProps} defaultValue={defaultValue} id={id} />
    </Form.Item>
  );
};

export default FormNumberWrapper;