import ClientForm from "@/components/Client/ClientForm";
import PageTitle from "@/components/PageTitle";
import { useClientById } from "@/hooks/client/useClientById";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: client } = useClientById({ id: id });
  return (
    <>
      <PageTitle
        title="Edit Client"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />

      <ClientForm editClientData={client} id={id} />
    </>
  );
};

export default EditClient;
