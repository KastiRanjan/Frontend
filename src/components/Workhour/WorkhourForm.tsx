
import React, { useEffect } from "react";
import { Form, InputNumber, TimePicker, Button, Select, DatePicker, Row, Col } from "antd";
import dayjs from "dayjs";
import { WorkhourType } from "../../types/workhour";

interface WorkhourFormProps {
	initialValues?: Partial<WorkhourType>;
	onSubmit: (values: any) => void;
	onCancel?: () => void;
	roles?: { label: string; value: string }[];
	loading?: boolean;
}

const WorkhourForm: React.FC<WorkhourFormProps> = ({ initialValues, onSubmit, onCancel, roles, loading }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (initialValues) {
			form.setFieldsValue({
				...initialValues,
				startTime: initialValues.startTime ? dayjs(initialValues.startTime, "HH:mm") : undefined,
				endTime: initialValues.endTime ? dayjs(initialValues.endTime, "HH:mm") : undefined,
				validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : undefined,
				roleId: initialValues.roleId,
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
		});
		form.resetFields();
	};

	// The fields are now fully independent; no calculation or binding logic
	const handleValuesChange = undefined;

	return (
		<Form 
			form={form} 
			layout="vertical" 
			onFinish={handleFinish}
			onValuesChange={handleValuesChange}
		>
			<Form.Item name="roleId" label="Role" rules={[{ required: true, message: "Role is required" }]}> 
				<Select options={roles} placeholder="Select role" />
			</Form.Item>
			
			<Row gutter={16}>
				<Col span={8}>
					<Form.Item name="workHours" label="Work Hours" rules={[{ required: true, message: "Work hours required" }]}> 
						<InputNumber 
							min={0.5} 
							max={24} 
							step={0.5}
							style={{ width: "100%" }} 
						/>
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item name="startTime" label="Start Time" rules={[{ required: true, message: "Start time required" }]}> 
						<TimePicker 
							format="HH:mm" 
							style={{ width: "100%" }}
						/>
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item name="endTime" label="End Time" rules={[{ required: true, message: "End time required" }]}> 
						<TimePicker 
							format="HH:mm" 
							style={{ width: "100%" }} 
						/>
					</Form.Item>
				</Col>
			</Row>
			
			<Form.Item name="validFrom" label="Valid From" rules={[{ required: true, message: "Valid from date is required" }]}> 
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
