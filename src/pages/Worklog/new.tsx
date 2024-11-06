import PageTitle from "@/components/PageTitle"
import WorklogForm from "@/components/Worklog/WorklogForm"
import { Button } from "antd"
import { useNavigate } from "react-router-dom";


const NewWorklog = () => {
  const navigate = useNavigate();

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
      <WorklogForm />
    </div>
  )
}

export default NewWorklog