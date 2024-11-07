import PageTitle from "@/components/PageTitle"
import OWorklogForm from "@/components/Worklog/OWorklogForm";
import WorklogForm from "@/components/Worklog/WorklogForm"
import { Button } from "antd"
import { useNavigate, useParams } from "react-router-dom";


const NewWorklog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div>
      <PageTitle
        title="Create worklog"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      {id ? <WorklogForm /> : <OWorklogForm />}
    </div>
  )
}

export default NewWorklog