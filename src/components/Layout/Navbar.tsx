import { useSession } from "@/context/SessionContext";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useContext } from "react";
import moment from "moment";
import { useCreateAttendence } from "@/hooks/attendence/useCreateAttendence";
import { useGetMyAttendence } from "@/hooks/attendence/useGetMyAttendence";

const Navbar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: any;
}) => {
  const { profile, isProfilePending } = useSession();
  console.log(profile);
  const { data, isLoading } = useGetMyAttendence();
  const{ mutate}= useCreateAttendence();

  console.log(data);

  const isClockedIn = data?.length > 0 ? true : false;

  const handleClockIn = () => {
    let payload = {
      date : moment().format("YYYY-MM-DD"),
      clockIn :moment().format("HH:mm:ss a"),      
    }
    mutate(payload)
    isClockedIn: true
  };

  const handleClockOut = () => {
    let payload = {
      clockOut: moment().format("HH:mm:ss a"),
      mutateedit(payload)
    };

  return (
    <Header className="border-b-[3px] bg-[#fff] p-0 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "16px",
            width: 64,
            height: 64,
          }}
        />
        <span>
          <Breadcrumb items={[{ title: "Home" }, { title: "Dashboard" }]} />
        </span>
      </div>

      <div>
  {isClockedIn ? (
    <Button type="primary" shape="round" onClick={handleClockOut} >
      Clock Out
    </Button>
  ) : (
    <Button type="primary" shape="round" onClick={handleClockIn}>
      Clock In
    </Button>
  )}
</div>


      <div className="pr-4">
        <Avatar
          // loading={isProfilePending}
          style={{ backgroundColor: "#0c66e4" }}
        >
          {profile?.name[0]}
        </Avatar>
      </div>
    </Header>
  );
};

export default React.memo(Navbar);
