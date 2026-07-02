import React from "react";
import { Modal, Tag, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface WorklogModalProps {
  open: boolean;
  onCancel: () => void;
  selectedDate: string;
  worklogs?: any[];
}

const WorklogModal: React.FC<WorklogModalProps> = ({
  open,
  onCancel,
  selectedDate,
  worklogs = [],
}) => {
  const formatDate = (date: string) => dayjs(date).format('MMMM DD, YYYY (dddd)');
  
  const dayWorklogs = worklogs.filter((w: any) => {
    try {
      const wDate = new Date(w.startTime).toISOString().split('T')[0];
      return wDate === selectedDate;
    } catch (e) {
      return false;
    }
  });

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          <span>Day Details - {formatDate(selectedDate)}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Worklogs
          </h3>
          {dayWorklogs.length > 0 ? (
            <div className="space-y-3">
              {dayWorklogs.map((worklog, idx) => (
                <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="font-medium text-green-900">{worklog.project?.name || 'Project'} - {worklog.task?.title || 'Task'}</div>
                  <div className="text-sm text-green-800 mt-1"><strong>User:</strong> {worklog.user?.name || 'Unknown'}</div>
                  <div className="text-sm text-green-800 mt-1"><strong>Duration:</strong> {worklog.durationMinutes} mins</div>
                  <div className="text-sm text-green-700 mt-1" dangerouslySetInnerHTML={{ __html: worklog.description }} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No worklogs for this date</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WorklogModal;
