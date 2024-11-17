import React from 'react';

const TableToolbar = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ marginBottom: 16 }}>
            {children}
        </div>
    );
};

export default TableToolbar;
