import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorklog } from "../../service/worklog.service";
import moment from "moment";

interface CreateWorklogPayload {
  projectId?: string;
  taskId: string;
  date?: any;
  startTime: any;
  endTime: any;
  description: string;
  status?: string;
  userId?: string;
  approvedBy?: string;
}

export const useCreateWorklog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateWorklogPayload[]) => {
      try {
        // Transform the data to properly combine date and time
        const transformedWorklogs = payload.map((worklog: any) => {
          console.log("Original worklog data:", worklog);
          let startTime, endTime;
          
          // Check if we have separate date and time fields (from forms)
          if (worklog.date && worklog.startTime && worklog.endTime) {
            // Extract the date components directly to avoid timezone conversion issues
            let baseDate;
            if (moment.isMoment(worklog.date) || (worklog.date && typeof worklog.date === 'object' && worklog.date.$d)) {
              // Get the actual date components from the moment object to avoid timezone shifts
              // Use the internal properties directly instead of creating a new moment
              const year = worklog.date.$y || worklog.date.year();
              const month = worklog.date.$M !== undefined ? worklog.date.$M : worklog.date.month(); // 0-based (0=Jan, 8=Sep)
              const day = worklog.date.$D || worklog.date.date();
              console.log("Extracted date components:", { year, month, day });
              // Create a new moment object with these exact components and set Nepal offset
              baseDate = moment.utc([year, month, day]).utcOffset('+05:45').startOf('day');
              console.log("Created base date UTC:", baseDate.format('YYYY-MM-DD HH:mm Z'));
            } else {
              // Parse the date string directly and set Nepal offset
              baseDate = moment(worklog.date).utcOffset('+05:45').startOf('day');
            }
            
            console.log("Base date parsed:", baseDate.format('YYYY-MM-DD'));
            console.log("Original date input:", worklog.date);
            console.log("Date components:", {
              year: worklog.date.year(),
              month: worklog.date.month(),
              day: worklog.date.date()
            });
            console.log("Base date timezone:", baseDate.format('YYYY-MM-DD HH:mm Z'));
            console.log("Start time input:", worklog.startTime);
            console.log("End time input:", worklog.endTime);
            console.log("Start time type:", typeof worklog.startTime, "isMoment:", moment.isMoment(worklog.startTime));
            console.log("End time type:", typeof worklog.endTime, "isMoment:", moment.isMoment(worklog.endTime));
            
            // Handle moment objects (including moment objects that don't pass isMoment check)
            if (worklog.startTime && typeof worklog.startTime === 'object' && worklog.startTime.$d) {
              // This is a moment object - extract time using internal properties
              const hour = worklog.startTime.$H !== undefined ? worklog.startTime.$H : moment(worklog.startTime).hour();
              const minute = worklog.startTime.$m !== undefined ? worklog.startTime.$m : moment(worklog.startTime).minute();
              console.log("Start time extracted - hour:", hour, "minute:", minute);
              startTime = baseDate.clone()
                .set({
                  hour: hour,
                  minute: minute,
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
              console.log("Start time combined with base date:", startTime);
            } else if (moment.isMoment(worklog.startTime)) {
              startTime = baseDate.clone()
                .set({
                  hour: worklog.startTime.hour(),
                  minute: worklog.startTime.minute(),
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
            } else if (typeof worklog.startTime === 'string' && worklog.startTime.includes(':')) {
              // If it's a time string like "09:30"
              const timeParts = worklog.startTime.split(':');
              startTime = baseDate.clone()
                .set({
                  hour: parseInt(timeParts[0]),
                  minute: parseInt(timeParts[1]),
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
            } else {
              // Fallback - try to parse as moment
              const startMoment = moment(worklog.startTime);
              startTime = baseDate.clone()
                .set({
                  hour: startMoment.hour(),
                  minute: startMoment.minute(),
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
            }
            
            if (worklog.endTime && typeof worklog.endTime === 'object' && worklog.endTime.$d) {
              // This is a moment object - extract time using internal properties
              const hour = worklog.endTime.$H !== undefined ? worklog.endTime.$H : moment(worklog.endTime).hour();
              const minute = worklog.endTime.$m !== undefined ? worklog.endTime.$m : moment(worklog.endTime).minute();
              console.log("End time extracted - hour:", hour, "minute:", minute);
              endTime = baseDate.clone()
                .set({
                  hour: hour,
                  minute: minute,
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
              console.log("End time combined with base date:", endTime);
            } else if (moment.isMoment(worklog.endTime)) {
              endTime = baseDate.clone()
                .set({
                  hour: worklog.endTime.hour(),
                  minute: worklog.endTime.minute(),
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
            } else if (typeof worklog.endTime === 'string' && worklog.endTime.includes(':')) {
              // If it's a time string like "17:30"
              const timeParts = worklog.endTime.split(':');
              endTime = baseDate.clone()
                .set({
                  hour: parseInt(timeParts[0]),
                  minute: parseInt(timeParts[1]),
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
            } else {
              // Fallback - try to parse as moment
              const endMoment = moment(worklog.endTime);
              endTime = baseDate.clone()
                .set({
                  hour: endMoment.hour(),
                  minute: endMoment.minute(),
                  second: 0,
                  millisecond: 0
                })
                .toISOString();
            }
          } else {
            // Use the provided startTime and endTime as-is
            startTime = moment(worklog.startTime).toISOString();
            endTime = moment(worklog.endTime).toISOString();
          }
          
          console.log("Transformed times:", { 
            originalDate: worklog.date, 
            startTime, 
            endTime,
            startTimeDate: moment(startTime).format('YYYY-MM-DD HH:mm'),
            endTimeDate: moment(endTime).format('YYYY-MM-DD HH:mm')
          });
          
          const transformed = {
            taskId: worklog.taskId,
            projectId: worklog.projectId, // Backend will derive from task if not provided
            description: worklog.description,
            startTime,
            endTime,
            status: worklog.status || "requested",
            // Handle approver field
            approvedBy: worklog.userId || worklog.approvedBy,
          };
          
          return transformed;
        });
        
        console.log("Final payload to backend:", transformedWorklogs);
        return await createWorklog(transformedWorklogs);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
      queryClient.invalidateQueries({ queryKey: ["worklogs"] });
    },
  });
};
