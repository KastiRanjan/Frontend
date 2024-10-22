// src/components/TaskTemplate.tsx

import React, { useEffect, useState } from "react";
import { Table } from "antd";
import axios from "axios";
import PageTitle from "@/components/PageTitle";

interface TaskTemplate {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
}

const TaskTemplate: React.FC = () => {
  const [data, setData] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:7777/task-template");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <>
      <PageTitle title="Task Template" />
      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
      />
    </>
  );
};

export default TaskTemplate;
