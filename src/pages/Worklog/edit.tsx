import PageTitle from "@/components/PageTitle";
import EWorklogForm from "@/components/Worklog/EWorklogForm";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const EditWorklog = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // If no ID is provided, redirect back or handle the error
  if (!id) {
    navigate("/worklogs-all"); // Or wherever makes sense in your app
    return null;
  }

  return (
    <div>
      <PageTitle
        title="Edit Worklog"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <EWorklogForm />
    </div>
  );
};

export default EditWorklog;