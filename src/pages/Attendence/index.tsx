import AttendenceTable from "@/components/Attendence/AttendenceTable";
import PageTitle from "@/components/PageTitle";


const Attendence = () => {
    return (
        <>
            <PageTitle title="Attendence" description="View your attendence " />
            <AttendenceTable />
        </>
    );
};

export default Attendence;