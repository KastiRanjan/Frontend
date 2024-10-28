import { useNavigate } from "react-router-dom";
import { MenuItem } from "./MenuItems";
import Sider from "antd/es/layout/Sider";
import { Drawer, Menu } from "antd";
import { useEffect, useState } from "react";

const WIDTH = 992;

const Sidebar = ({
  collapsed,
  menuItems,
}: {
  collapsed: boolean;
  menuItems: MenuItem[];
}) => {
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
    const selectedItem = menuItems.find(
      (item: MenuItem) => item.key === selectedKey
    );

    if (selectedItem) {
      navigate(selectedItem.key);
    }
  };

  return (
    <>
      {!isMobile ? (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          theme="light"
          className="border-r-[3px] h-screen overflow-hidden"
        >
          <div className="h-[32px] bg-[#fff3] m-5 rounded">
            <div className="relative z-20 flex items-center text-lg font-medium ">
              <div className="bg-[#0c66e4] rounded py-3 px-3 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
                </svg>
              </div>
              <div className={`${collapsed ? "hidden" : "visible"}`}>
                <h5>Artha task</h5>
                <p className="text-xs text-zinc-400 whitespace-nowrap">
                  Manage your project
                </p>
              </div>
            </div>
          </div>
          <Menu
            onClick={handleChangePage}
            theme="light"
            defaultSelectedKeys={["1"]}
            items={menuItems}
            className="border-inline-0"
          />
          {/* <div className="absolute bottom-5 right-5">
            <span className="text-sm">{new Date().toLocaleString()}</span>
          </div> */}
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
            items={menuItems}
          />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
