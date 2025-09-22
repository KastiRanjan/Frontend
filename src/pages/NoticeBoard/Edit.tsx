import NoticeBoardForm from "@/components/NoticeBoard/NoticeBoardForm";
import { Card } from "antd";
import { useParams } from "react-router-dom";

const EditNoticePage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <Card>
      <NoticeBoardForm id={id} />
    </Card>
  );
};

export default EditNoticePage;