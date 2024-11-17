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
  <div>
    <Title level={4}>{title}</Title>
    {element}
  </div>
);

export default PageTitle;
