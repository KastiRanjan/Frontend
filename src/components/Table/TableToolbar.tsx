import { Space } from 'antd';
import React from 'react';

const TableToolbar = ({ children }: { children: React.ReactNode }) => {
    return (
        <Space style={{ marginBottom: 16 }}>
            {children}
        </Space>
    );
};

export default TableToolbar;
