import React from 'react';
import { Row, Col } from 'antd';
import PageTitle from '../../components/PageTitle';
import HolidayTable from '../../components/Holiday/HolidayTable';
import HolidayForm from '../../components/Holiday/HolidayForm';

const HolidayPage: React.FC = () => {
  return (
    <div>
      <PageTitle title="Holiday Management" />
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <HolidayForm />
        </Col>
        <Col span={24}>
          <HolidayTable />
        </Col>
      </Row>
    </div>
  );
};

export default HolidayPage;
