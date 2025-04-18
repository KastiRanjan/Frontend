import PageTitle from "@/components/PageTitle";
import WorklogTable from "@/components/Worklog/WorklogTable";
import { useWorklogById } from "@/hooks/worklog/useWorklogById";
import { Card } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const Worklog: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useWorklogById({ id });
  return (
    <>
      <PageTitle
        title="Worklog"
      />
      <Card>
        <WorklogTable data={data} />
      </Card>
    </>
  );
};

export default Worklog;
