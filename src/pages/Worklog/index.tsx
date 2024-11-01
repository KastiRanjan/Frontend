import WorklogTable from '@/components/Worklog/WorklogTable';
import { useWorklogById } from '@/hooks/worklog/useWorklogById';
import React from 'react';
import { useParams } from 'react-router-dom';

const Worklog: React.FC = () => {
  const { id } = useParams();
  const { isLoading, isError, data, error } = useWorklogById({ id: id?.toString() });
  return (
    <>
    <WorklogTable data={data}/>
    </>
  );
};

export default Worklog;
