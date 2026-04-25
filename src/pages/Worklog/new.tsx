import PageTitle from "@/components/PageTitle"
import OWorklogForm from "@/components/Worklog/OWorklogForm";
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
      <OWorklogForm />
    </div>
  )
}

export default NewWorklog