
import React from "react";
import { Table, Button, Popconfirm } from "antd";
import { WorkhourType } from "../../types/workhour";
import { useWorkhours, useDeleteWorkhour } from "../../hooks/workhour/useWorkhour";

interface WorkhourTableProps {
	onEdit: (workhour: WorkhourType) => void;
}

const WorkhourTable: React.FC<WorkhourTableProps> = ({ onEdit }) => {
	const { data, isLoading } = useWorkhours();
	const deleteMutation = useDeleteWorkhour();

	const columns = [
		{
			title: "User",
			dataIndex: ["user", "name"],
			key: "user",
			render: (_: any, record: WorkhourType) => record.user?.name || "-",
		},
		{
			title: "Work Hours",
			dataIndex: "workHours",
			key: "workHours",
		},
		{
			title: "Start Time",
			dataIndex: "startTime",
			key: "startTime",
		},
		{
			title: "End Time",
			dataIndex: "endTime",
			key: "endTime",
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: WorkhourType) => (
				<>
					<Button type="link" onClick={() => onEdit(record)}>
						Edit
					</Button>
					<Popconfirm
						title="Are you sure to delete?"
						onConfirm={() => deleteMutation.mutate(record.id)}
						okText="Yes"
						cancelText="No"
					>
						<Button type="link" danger loading={deleteMutation.isPending}>
							Delete
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={data || []}
			loading={isLoading}
			pagination={false}
		/>
	);
};

export default WorkhourTable;
