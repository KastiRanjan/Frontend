
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

	// Calculate end time based on start time and work hours
	const calculateEndTime = (startTime: dayjs.Dayjs, workHours: number) => {
		if (!startTime || !workHours) return null;
		
		const hours = Math.floor(workHours);
		const minutes = Math.round((workHours - hours) * 60);
		
		return startTime.add(hours, 'hour').add(minutes, 'minute');
	};

	// Calculate start time based on end time and work hours
	const calculateStartTime = (endTime: dayjs.Dayjs, workHours: number) => {
		if (!endTime || !workHours) return null;
		
		const hours = Math.floor(workHours);
		const minutes = Math.round((workHours - hours) * 60);
		
		return endTime.subtract(hours, 'hour').subtract(minutes, 'minute');
	};
	
	// Calculate work hours based on start time and end time
	const calculateWorkHours = (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs) => {
		if (!startTime || !endTime) return null;
		
		const startMinutes = startTime.hour() * 60 + startTime.minute();
		const endMinutes = endTime.hour() * 60 + endTime.minute();
		
		// Handle cases where end time is on the next day
		let diffMinutes = endMinutes - startMinutes;
		if (diffMinutes < 0) {
			diffMinutes += 24 * 60; // Add 24 hours in minutes
		}
		
		return Math.round((diffMinutes / 60) * 10) / 10; // Round to 1 decimal place
	};

	// Handle changes to form fields
	const handleValuesChange = (changedValues: any) => {
		const formValues = form.getFieldsValue();
		
		// Don't skip auto-calculation anymore, even when a field is being edited
		// if (manuallyEditing) return;

		// If work hours changed
		if ('workHours' in changedValues) {
			const workHours = changedValues.workHours;
			
			if (formValues.startTime) {
				// Calculate end time based on start time and work hours
				const endTime = calculateEndTime(formValues.startTime, workHours);
				if (endTime) {
					form.setFieldsValue({ endTime });
				}
			} else if (formValues.endTime) {
				// Calculate start time based on end time and work hours
				const startTime = calculateStartTime(formValues.endTime, workHours);
				if (startTime) {
					form.setFieldsValue({ startTime });
				}
			}
		}
		
		// If start time changed
		if ('startTime' in changedValues) {
			const startTime = changedValues.startTime;
			
			if (startTime && formValues.workHours) {
				// Calculate end time based on start time and work hours
				const endTime = calculateEndTime(startTime, formValues.workHours);
				if (endTime) {
					form.setFieldsValue({ endTime });
				}
			} else if (startTime && formValues.endTime) {
				// Calculate work hours based on start and end time
				const workHours = calculateWorkHours(startTime, formValues.endTime);
				if (workHours) {
					form.setFieldsValue({ workHours });
				}
			}
		}
		
		// If end time changed
		if ('endTime' in changedValues) {
			const endTime = changedValues.endTime;
			
			if (endTime && formValues.workHours && !formValues.startTime) {
				// Calculate start time based on end time and work hours
				const startTime = calculateStartTime(endTime, formValues.workHours);
				if (startTime) {
					form.setFieldsValue({ startTime });
				}
			} else if (endTime && formValues.startTime) {
				// Calculate work hours based on start and end time
				const workHours = calculateWorkHours(formValues.startTime, endTime);
				if (workHours) {
					form.setFieldsValue({ workHours });
				}
			}
		}
	};

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
