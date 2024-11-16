import { Breadcrumb } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

const PageTitle = ({
  title,
  element,
  description
}: {
  title?: string;
  element?: JSX.Element;
  description?: string
}) => (
  <div className="py-4">
    <Breadcrumb style={{ margin: "5px 0" }}>
      <Breadcrumb.Item>Home</Breadcrumb.Item>
      <Breadcrumb.Item>Projects</Breadcrumb.Item>
    </Breadcrumb>
    <Title level={4}>{title}</Title>
    {/* {description && <Paragraph>
      {description}
    </Paragraph>} */}
    {element}
  </div>
);

export default PageTitle;
