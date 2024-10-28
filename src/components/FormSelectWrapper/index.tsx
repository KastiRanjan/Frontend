import React from "react";
import { Form, Select } from "antd";
import { rest } from "lodash";

interface FormSelectWrapperProps {
  children?: React.ReactNode;
  error?: string;
  rules?: any[];
  options: { value: string; label: string }[];
  allowClear?: boolean;
  disabled?: boolean;
  label?: string;
  name: string;
  id: string;
  classname?: string;
  changeHandler?: any;
  value?: string;
  placeholder?: string;
  required?: boolean;
  mode?: "multiple" | "tags";
}

const FormSelectWrapper = (props: FormSelectWrapperProps) => {
  const {
    label = null,
    rules = [],
    options,
    placeholder,
    children = null,
    required = false,
    disabled = false,
    name,
    id,
    classname = "h-[48px]",
    changeHandler = () => {},
    value,
    allowClear = false,
    error,
    mode,
    ...rest
  } = props;

  return (
    <>
      {children}
      <Form.Item
        label={label ? label : ""}
        name={name}
        rules={rules}
        required={required}
        validateStatus={error ? "error" : undefined}
        help={error}
        hasFeedback
      >
        <Select
          className={classname}
          placeholder={placeholder}
          options={options}
          onChange={changeHandler}
          value={value}
          disabled={disabled}
          allowClear={allowClear}
          mode={mode}
          {...rest}
        />
      </Form.Item>
    </>
  );
};

export default FormSelectWrapper;
