import Title from "antd/es/typography/Title";

const PageTitle = ({
  title,
  element,
  extra,
  description
}: {
  title?: string | JSX.Element;
  element?: JSX.Element;
  extra?: JSX.Element;
  description?: string
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <div>
      {typeof title === 'string' ? <Title level={4}>{title}</Title> : title}
      {description && <p>{description}</p>}
    </div>
    <div>
      {extra || element}
    </div>
  </div>
);

export default PageTitle;
