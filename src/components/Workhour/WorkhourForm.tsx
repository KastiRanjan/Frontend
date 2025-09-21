
import React, { useEffect } from "react";
import { Form, InputNumber, TimePicker, Button, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { WorkhourType } from "../../types/workhour";

interface WorkhourFormProps {
	initialValues?: Partial<WorkhourType>;
	onSubmit: (values: any) => void;
	onCancel?: () => void;
	users?: { label: string; value: number }[];
	loading?: boolean;
}

const WorkhourForm: React.FC<WorkhourFormProps> = ({ initialValues, onSubmit, onCancel, users, loading }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (initialValues) {
			form.setFieldsValue({
				...initialValues,
				startTime: initialValues.startTime ? dayjs(initialValues.startTime, "HH:mm") : undefined,
				endTime: initialValues.endTime ? dayjs(initialValues.endTime, "HH:mm") : undefined,
				validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : undefined,
				validTo: initialValues.validTo ? dayjs(initialValues.validTo) : undefined,
				userId: initialValues.user?.id,
			});
		} else {
			form.resetFields();
		}
	}, [initialValues, form]);

	const handleFinish = (values: any) => {
		onSubmit({
			...values,
			startTime: values.startTime ? values.startTime.format("HH:mm") : undefined,
			endTime: values.endTime ? values.endTime.format("HH:mm") : undefined,
			validFrom: values.validFrom ? values.validFrom.format("YYYY-MM-DD") : undefined,
			validTo: values.validTo ? values.validTo.format("YYYY-MM-DD") : undefined,
		});
		form.resetFields();
	};

	return (
		<Form form={form} layout="vertical" onFinish={handleFinish}>
			<Form.Item name="userId" label="User" rules={[{ required: true, message: "User is required" }]}> 
				<Select options={users} placeholder="Select user" />
			</Form.Item>
			<Form.Item name="workHours" label="Work Hours" rules={[{ required: true, message: "Work hours required" }]}> 
				<InputNumber min={1} max={24} style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item name="startTime" label="Start Time" rules={[{ required: true, message: "Start time required" }]}> 
				<TimePicker format="HH:mm" style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item name="endTime" label="End Time" rules={[{ required: true, message: "End time required" }]}> 
				<TimePicker format="HH:mm" style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item name="validFrom" label="Valid From" rules={[{ required: false, message: "Valid from date" }]}> 
				<DatePicker style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item name="validTo" label="Valid To" rules={[{ required: false, message: "Valid to date" }]}> 
				<DatePicker style={{ width: "100%" }} />
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit" loading={loading}>
					Submit
				</Button>
				{onCancel && (
					<Button style={{ marginLeft: 8 }} onClick={onCancel}>
						Cancel
					</Button>
				)}
			</Form.Item>
		</Form>
	);
};

export default WorkhourForm;
