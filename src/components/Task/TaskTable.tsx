import { Table } from "antd";



const TaskTable: React.FC = ({data}:any) => {
    const columns = [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
        },
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
        },
        {
          title: 'Created At',
          dataIndex: 'createdAt',
          key: 'createdAt',
        },
        {
          title: 'Updated At',
          dataIndex: 'updatedAt',
          key: 'updatedAt',
        },
        {
          title: 'Due Date',
          dataIndex: 'dueDate',
          key: 'dueDate',
          Cell: ({ value }: { value: string | null }) => (value ? value : 'N/A'),
        },
      ];
    
    return (
        <>
            <p>Task Table</p>

            <Table
                columns={columns}  
                data={data}
            /> 
        </>
    )
}

export default TaskTable


