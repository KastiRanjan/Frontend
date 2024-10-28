import { Table } from "antd";



const TaskTable: React.FC = ({data}:any) => {
  console.log(data)
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
        },
      ];
    
    return (
        <>
            <p>Task Table</p>

            <Table
                columns={columns}  
                dataSource={data}
            /> 
        </>
    )
}

export default TaskTable


