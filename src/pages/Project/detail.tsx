import PageTitle from "@/components/PageTitle";
import { useProjectById } from "@/hooks/project/useProjectById";
import { useNavigate, useParams } from "react-router-dom";
// import { Button } from "antd";
import ProjectDetailComponent from "@/components/project/ProjectDetail";
import { Button } from "antd";


const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data , isPending} = useProjectById({id: id?.toString()});
    if(isPending) return <div>Loading...</div>


    return (
        <>
        <PageTitle
        title="Project Detail" element={<Button type="primary" onClick={() => navigate(-1)}>
        Close
      </Button>}/>
        
        <ProjectDetailComponent project={data} id={id}/>
     
     </>
    );
    
};


export default ProjectDetail;