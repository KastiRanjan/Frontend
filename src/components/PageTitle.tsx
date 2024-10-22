import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

const PageTitle = ({
  title,
  element,
}: {
  title?: string;
  element?: JSX.Element;
}) => (
  <div className="mb-4 py-4">
    <Title level={3}>{title}</Title>
    <Paragraph>
      Add, search, and manage your permmissions all in one place.{" "}
    </Paragraph>
    {element}
  </div>
);

export default PageTitle;
