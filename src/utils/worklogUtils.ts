import dayjs from "dayjs";
import { WorkhourType } from "../types/workhour";

export enum WorklogStatus {
  NORMAL = "normal",
  EARLY = "early",
  LATE = "late",
  LATE_APPROVED = "late-approved",
  LATE_UNAPPROVED = "late-unapproved",
  REJECTED_THEN_APPROVED = "rejected-approved"
}

/**
 * Determines the type of worklog based on its time and status history
 */
export const getWorklogType = (
  worklog: any,
  activeWorkhour?: WorkhourType | null
): WorklogStatus => {
  // Check if this worklog was previously rejected and now approved
  if (worklog.status === "approved" && worklog.wasRejected) {
    return WorklogStatus.REJECTED_THEN_APPROVED;
  }

  // Check if the worklog was approved more than 12 hours after it was requested
  if (
    worklog.status === "approved" &&
    worklog.requestedAt &&
    worklog.approvedAt
  ) {
    const requestTime = dayjs(worklog.requestedAt);
    const approvalTime = dayjs(worklog.approvedAt);
    const hoursDifference = approvalTime.diff(requestTime, "hour");

    if (hoursDifference > 12) {
      return WorklogStatus.LATE_APPROVED;
    }
  }
  
  // Check if the worklog is still in requested status but more than 12 hours have passed
  if (
    worklog.status === "requested" &&
    worklog.requestedAt
  ) {
    const requestTime = dayjs(worklog.requestedAt);
    const currentTime = dayjs();
    const hoursDifference = currentTime.diff(requestTime, "hour");

    if (hoursDifference > 12) {
      return WorklogStatus.LATE_UNAPPROVED;
    }
  }

  // If no workhour settings are available, return normal
  if (!activeWorkhour) {
    return WorklogStatus.NORMAL;
  }

  // Compare worklog time with workhour settings
  const worklogStartTime = dayjs(worklog.startTime).format("HH:mm");
  
  // Only compare times for simplicity
  const workhourStartTime = activeWorkhour.startTime || "09:00";
  
  // Check if early or late
  if (worklogStartTime < workhourStartTime) {
    return WorklogStatus.EARLY;
  } else if (worklogStartTime > workhourStartTime) {
    return WorklogStatus.LATE;
  }

  return WorklogStatus.NORMAL;
};

/**
 * Returns the appropriate CSS color for a worklog type
 */
export const getWorklogTypeColor = (type: WorklogStatus): string => {
  switch (type) {
    case WorklogStatus.NORMAL:
      return "#1890ff"; // Blue
    case WorklogStatus.EARLY:
      return "#52c41a"; // Green
    case WorklogStatus.LATE:
      return "#faad14"; // Orange/Yellow
    case WorklogStatus.LATE_APPROVED:
      return "#722ed1"; // Purple
    case WorklogStatus.LATE_UNAPPROVED:
      return "#f5222d"; // Red
    case WorklogStatus.REJECTED_THEN_APPROVED:
      return "#eb2f96"; // Pink
    default:
      return "#1890ff"; // Default blue
  }
};

/**
 * Returns a description of the worklog type
 */
export const getWorklogTypeDescription = (type: WorklogStatus): string => {
  switch (type) {
    case WorklogStatus.NORMAL:
      return "Normal worklog";
    case WorklogStatus.EARLY:
      return "Early worklog (before regular work hours)";
    case WorklogStatus.LATE:
      return "Late worklog (after regular work hours)";
    case WorklogStatus.LATE_APPROVED:
      return "Approved late (more than 12 hours after request)";
    case WorklogStatus.LATE_UNAPPROVED:
      return "Requested but unapproved for more than 12 hours";
    case WorklogStatus.REJECTED_THEN_APPROVED:
      return "Previously rejected, now approved";
    default:
      return "";
  }
};