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
  <div className="mb-4 py-4">
    <Title level={3}>{title}</Title>
    {description && <Paragraph>
      {description}
    </Paragraph>}
    {element}
  </div>
);

export default PageTitle;
