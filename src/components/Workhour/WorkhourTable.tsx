
import React, { useState, useRef } from "react";
import { Table, Button, Popconfirm, Input, Space } from "antd";
import { WorkhourType } from "../../types/workhour";
import { useWorkhours, useDeleteWorkhour } from "../../hooks/workhour/useWorkhour";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words';

interface WorkhourTableProps {
	onEdit: (workhour: WorkhourType) => void;
}

const WorkhourTable: React.FC<WorkhourTableProps> = ({ onEdit }) => {
	const { data, isLoading } = useWorkhours();
	const deleteMutation = useDeleteWorkhour();
	const [searchText, setSearchText] = useState('');
	const [searchedColumn, setSearchedColumn] = useState('');
	const [sortedInfo, setSortedInfo] = useState<any>({});
	const searchInput = useRef<any>(null);

	const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
		confirm();
		setSearchText(selectedKeys[0]);
		setSearchedColumn(dataIndex);
	};

	const handleReset = (clearFilters: () => void) => {
		clearFilters();
		setSearchText('');
	};

	const handleTableChange = (pagination: any, filters: any, sorter: any) => {
		setSortedInfo(sorter);
	};

	const getColumnSearchProps = (dataIndex: string, title: string): any => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={searchInput}
					placeholder={`Search ${title}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90 }}
					>
						Search
					</Button>
					<Button
						onClick={() => handleReset(clearFilters)}
						size="small"
						style={{ width: 90 }}
					>
						Reset
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered: boolean) => (
			<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
		),
		onFilter: (value: string, record: any) => {
			if (dataIndex.includes('.')) {
				const keys = dataIndex.split('.');
				let val = record;
				for (const key of keys) {
					if (!val) return false;
					val = val[key];
				}
				return val ? val.toString().toLowerCase().includes(value.toLowerCase()) : false;
			}
			return record[dataIndex]
				? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
				: '';
		},
		onFilterDropdownVisibleChange: (visible: boolean) => {
			if (visible) {
				setTimeout(() => searchInput.current?.select(), 100);
			}
		},
		render: (text: string) =>
			searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
					searchWords={[searchText]}
					autoEscape
					textToHighlight={text ? text.toString() : ''}
				/>
			) : (
				text
			),
	});

	const columns = [
		{
			title: "User",
			dataIndex: ["user", "name"],
			key: "user",
			...getColumnSearchProps('user.name', 'User'),
			sorter: (a: WorkhourType, b: WorkhourType) => 
				(a.user?.name || '').localeCompare(b.user?.name || ''),
			sortOrder: sortedInfo.columnKey === 'user' && sortedInfo.order,
			render: (_: any, record: WorkhourType) => record.user?.name || "-",
		},
		{
			title: "Work Hours",
			dataIndex: "workHours",
			key: "workHours",
			...getColumnSearchProps('workHours', 'Work Hours'),
			sorter: (a: WorkhourType, b: WorkhourType) => 
				(Number(a.workHours) || 0) - (Number(b.workHours) || 0),
			sortOrder: sortedInfo.columnKey === 'workHours' && sortedInfo.order,
		},
		{
			title: "Start Time",
			dataIndex: "startTime",
			key: "startTime",
			...getColumnSearchProps('startTime', 'Start Time'),
			sorter: (a: WorkhourType, b: WorkhourType) => 
				(a.startTime || '').localeCompare(b.startTime || ''),
			sortOrder: sortedInfo.columnKey === 'startTime' && sortedInfo.order,
		},
		{
			title: "End Time",
			dataIndex: "endTime",
			key: "endTime",
			...getColumnSearchProps('endTime', 'End Time'),
			sorter: (a: WorkhourType, b: WorkhourType) => 
				(a.endTime || '').localeCompare(b.endTime || ''),
			sortOrder: sortedInfo.columnKey === 'endTime' && sortedInfo.order,
		},
		{
			title: "Valid From",
			dataIndex: "validFrom",
			key: "validFrom",
			...getColumnSearchProps('validFrom', 'Valid From'),
			sorter: (a: WorkhourType, b: WorkhourType) => 
				(a.validFrom || '').localeCompare(b.validFrom || ''),
			sortOrder: sortedInfo.columnKey === 'validFrom' && sortedInfo.order,
		},
		{
			title: "Valid To",
			dataIndex: "validTo",
			key: "validTo",
			...getColumnSearchProps('validTo', 'Valid To'),
			sorter: (a: WorkhourType, b: WorkhourType) => 
				(a.validTo || '').localeCompare(b.validTo || ''),
			sortOrder: sortedInfo.columnKey === 'validTo' && sortedInfo.order,
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: WorkhourType) => (
				<Space>
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
				</Space>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={data || []}
			loading={isLoading}
			onChange={handleTableChange}
			pagination={{
				showSizeChanger: true,
				showQuickJumper: true,
				pageSizeOptions: [5, 10, 20, 50],
				showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
			}}
		/>
	);
};

export default WorkhourTable;
