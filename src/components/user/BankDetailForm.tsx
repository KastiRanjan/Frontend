import React, { useState } from 'react';
import { Table, Input, Button, Popconfirm, message, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCreateUserDetail } from '@/hooks/user/userCreateuserDetail';
import { useParams } from 'react-router-dom';

const BankDetailForm = ({ initialValues }: any) => {
  const [dataSource, setDataSource] = useState<any[]>(initialValues);
  const [count, setCount] = useState(initialValues.length); // Track number of rows
  const { mutate } = useCreateUserDetail();
  const { id } = useParams();

  const uploadProps = {
    name: 'file',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload() {
      return false; // To prevent automatic upload, we want manual control
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter(item => item.key !== key);
    setDataSource(newData);
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      bankName: '',
      bankBranch: '',
      accountNo: '',
      documentFile: null,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = async (row: any) => {
    const formData = new FormData();
    formData.append('bankName', row.bankName);
    formData.append('bankBranch', row.bankBranch);
    formData.append('accountNo', row.accountNo);
    formData.append('id', id);

    if (row.documentFile) {
      formData.append('documentFile', row.documentFile.originFileObj as File);
    }

    try {
      await mutate({ id, payload: formData, query: 'bank' });
      message.success('Record saved successfully');
    } catch (error) {
      message.error('Failed to save record');
    }
  };

  // Editable cell component
  const EditableCell = ({
    title,
    editable,
    children,
    record,
    columnKey,
    ...restProps
  }: any) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(children);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };

    const handleBlur = () => {
      setEditing(false);
      record[columnKey] = value; // Update record data
    };

    const handleSave = () => {
      setEditing(false);
      record[columnKey] = value;
      handleSave(record); // Save the record after editing
    };

    return (
      <td {...restProps}>
        {editing ? (
          columnKey === 'documentFile' ? (
            <Upload {...uploadProps} fileList={record.documentFile ? [record.documentFile] : []} onChange={(info) => {
              if (info.file.status === 'done') {
                record.documentFile = info.file;
              }
            }}>
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          ) : (
            <Input value={value} onChange={handleChange} onBlur={handleBlur} />
          )
        ) : (
          <div
            className="editable-cell-value"
            onClick={() => setEditing(true)}
          >
            {children}
          </div>
        )}
      </td>
    );
  };

  const editableColumns = [
    {
      title: 'Bank Name',
      editable: true,
      dataIndex: 'bankName',
      key: 'bankName',
    },
    {
      title: 'Bank Branch',
      editable: true,
      dataIndex: 'bankBranch',
      key: 'bankBranch',
    },
    {
      title: 'Account Number',
      editable: true,
      dataIndex: 'accountNo',
      key: 'accountNo',
    },
    {
      title: 'Upload File',
      editable: true,
      dataIndex: 'documentFile',
      key: 'documentFile',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <span>
          <a onClick={() => handleSave(record)} style={{ marginRight: 16 }}>Save</a>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.key)}>
            <a>Delete</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={dataSource}
        columns={editableColumns}
        rowClassName="editable-row"
        pagination={false}
        rowKey="key"
      />
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Button onClick={handleAdd} type="dashed" icon={<UploadOutlined />} block>
            Add New Record
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default BankDetailForm;
