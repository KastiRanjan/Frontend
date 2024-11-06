import PageTitle from "@/components/PageTitle"
import WorklogForm from "@/components/Worklog/WorklogForm"
import { Button } from "antd"


const NewWorklog = () => {

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