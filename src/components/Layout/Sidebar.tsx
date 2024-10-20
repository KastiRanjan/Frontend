import { useNavigate } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import Sider from "antd/es/layout/Sider";
import { Drawer, Menu } from "antd";
import { useEffect, useState } from "react";

const WIDTH = 992;

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    window.onresize = () => {
      /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)
        ? setIsMobile(true)
        : setIsMobile(false);
    };
    const rect = document.body.getBoundingClientRect();
    const needCollapse = rect.width < WIDTH;
  }, []);

  const handleChangePage = (e: any) => {
    const selectedKey = e.key;
    const selectedItem = MenuItems.find((item) => item.key === selectedKey);

    if (selectedItem) {
      navigate(selectedItem.key);
    }
  };

  console.log(isMobile);
  return (
    <>
      {!isMobile ? (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          theme="light"
          className="border-r"
        >
          <div className="h-[32px] bg-[#fff3] m-5 rounded" />
          <Menu
            onClick={handleChangePage}
            theme="light"
            defaultSelectedKeys={["1"]}
            items={MenuItems}
          />
        </Sider>
      ) : (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setIsMobile(false)}
          visible={isMobile}
        >
          <Menu
            onClick={handleChangePage}
            theme="light"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={MenuItems}
          />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
