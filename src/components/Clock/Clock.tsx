import { useCreateAttendence } from "@/hooks/attendence/useCreateAttendence";
import { useGetMyAttendence } from "@/hooks/attendence/useGetMyAttendence";
import { useUpdateAttendence } from "@/hooks/attendence/useUpdateAttendence";
import { Button, Modal, Input } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

const Clock = () => {
  const { data, refetch } = useGetMyAttendence();
  const { mutate: createAttendance } = useCreateAttendence();
  const { mutate: updateAttendance } = useUpdateAttendence();
  const isClockedIn = data?.length > 0 ? true : false;
  const isClockedOut = isClockedIn && !!data?.[0]?.clockOut;
  const [timer, setTimer] = useState(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [remark, setRemark] = useState<string>("");
  const [isClockOutModalVisible, setIsClockOutModalVisible] = useState(false);

  const getLocation = () => {
    return new Promise<{ latitude: number; longitude: number }>(
      (resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              reject(error);
            }
          );
        } else {
          reject(new Error("Geolocation not supported"));
        }
      }
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async () => {
    Modal.confirm({
      title: "Confirm Clock In",
      content: "Are you sure you want to clock in now?",
      onOk: async () => {
        try {
          const currentLocation = await getLocation();
          setLocation(currentLocation);

          const payload = {
            date: moment().format("YYYY-MM-DD"),
            clockIn: moment().format("HH:mm:ss a"), // Send as HH:mm:ss a
            latitude: currentLocation.latitude.toString(),
            longitude: currentLocation.longitude.toString(),
          };

          createAttendance(payload, {
            onSuccess: () => refetch(),
          });
        } catch (error) {
          console.error("Error getting location:", error);
          Modal.error({
            title: "Error",
            content: "Failed to get location. Please try again.",
          });
        }
      },
      onCancel: () => {
        console.log("Clock in cancelled");
      },
    });
  };

  const handleClockOut = () => {
    if (isClockedOut) {
      Modal.info({
        title: "Clock Out Status",
        content: "Today's final clock out has been set, can't modify now.",
        okText: "OK",
      });
    } else {
      setIsClockOutModalVisible(true);
    }
  };

  const handleClockOutConfirm = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const payload = {
        clockOut: moment().format("HH:mm:ss a").toString(),
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
        remark: remark || undefined,
      };

      createAttendance(payload, {
        onSuccess: () => {
          refetch();
          setRemark("");
          setIsClockOutModalVisible(false);
        },
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Modal.error({
        title: "Error",
        content: "Failed to get location. Please try again.",
      });
    }
  };

  const handleSetFinalClockOut = async () => {
    if (!isClockedIn || !data?.[0]?.id) {
      Modal.error({
        title: "Error",
        content: "No attendance record found to set final clock-out.",
      });
      return;
    }

    Modal.confirm({
      title: "Set Final Clock Out",
      content: "Are you sure you want to set this as your final clock-out for the day?",
      onOk: async () => {
        try {
          const currentLocation = await getLocation();
          setLocation(currentLocation);

          const payload = {
            clockOut: moment().format("HH:mm:ss a"), // Send as HH:mm:ss a
            latitude: currentLocation.latitude.toString(),
            longitude: currentLocation.longitude.toString(),
          };

          updateAttendance(
            { payload, id: data[0].id },
            {
              onSuccess: () => refetch(),
            }
          );
        } catch (error) {
          console.error("Error setting final clock-out:", error);
          Modal.error({
            title: "Error",
            content: "Failed to set final clock-out. Please try again.",
          });
        }
      },
      onCancel: () => {
        console.log("Final clock-out cancelled");
      },
    });
  };

  return (
    <>
      <div>
        {!isClockedIn ? (
          <Button type="primary" shape="round" onClick={handleClockIn}>
            Clock In {moment().format("HH:mm:ss a")}
          </Button>
        ) : (
          <div>
            <Button
              type={isClockedOut ? "default" : "primary"}
              shape="round"
              onClick={handleClockOut}
            >
              {isClockedOut ? "Clocked Out" : "Clock Out"} {moment().format("HH:mm:ss a")}
            </Button>
            {!isClockedOut && (
              <Button
                type="default"
                shape="round"
                onClick={handleSetFinalClockOut}
                style={{ marginLeft: 10 }}
              >
                Set Final Clock Out
              </Button>
            )}
          </div>
        )}
      </div>
      <Modal
        title="Confirm Clock Out"
        visible={isClockOutModalVisible}
        onOk={handleClockOutConfirm}
        onCancel={() => {
          setIsClockOutModalVisible(false);
          setRemark("");
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to clock out now?</p>
        <Input
          placeholder="Enter a remark (optional)"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          style={{ marginTop: 10 }}
        />
      </Modal>
    </>
  );
};

export default Clock;