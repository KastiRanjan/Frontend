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
  const [clockInRemark, setClockInRemark] = useState<string>("");
  const [clockOutRemark, setClockOutRemark] = useState<string>("");
  const [historyRemark, setHistoryRemark] = useState<string>("");
  const [isClockInModalVisible, setIsClockInModalVisible] = useState(false);
  const [isClockOutModalVisible, setIsClockOutModalVisible] = useState(false);
  const [isFinalClockOutModalVisible, setIsFinalClockOutModalVisible] = useState(false); // New state for final clockout modal

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

  const handleClockIn = () => {
    console.log("Opening Clock In Modal");
    setIsClockInModalVisible(true);
  };

  const handleClockInConfirm = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const payload = {
        date: moment().format("YYYY-MM-DD"),
        clockIn: moment().format("HH:mm:ss a"),
        clockInRemark: clockInRemark || undefined,
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
      };

      console.log("Clock In Payload:", payload);

      createAttendance(payload, {
        onSuccess: () => {
          console.log("Clock In Success");
          refetch();
          setClockInRemark("");
          setIsClockInModalVisible(false);
        },
        onError: (error) => console.error("Clock In Error:", error),
      });
    } catch (error) {
      console.error("Clock In Location Error:", error);
      Modal.error({
        title: "Error",
        content: "Failed to get location. Please try again.",
      });
    }
  };

  const handleClockOut = () => {
    if (isClockedOut) {
      Modal.info({
        title: "Clock Out Status",
        content: "Today's final clock out has been set, can't modify now.",
        okText: "OK",
      });
    } else {
      console.log("Opening Normal Clock Out Modal");
      setIsClockOutModalVisible(true);
    }
  };

  const handleClockOutConfirm = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const payload = {
        clockOut: moment().format("HH:mm:ss a"),
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
        remark: historyRemark || undefined,
      };

      console.log("Normal Clock Out Payload:", payload);

      createAttendance(payload, {
        onSuccess: () => {
          console.log("Normal Clock Out Success");
          refetch();
          setHistoryRemark("");
          setIsClockOutModalVisible(false);
        },
        onError: (error) => console.error("Normal Clock Out Error:", error),
      });
    } catch (error) {
      console.error("Normal Clock Out Location Error:", error);
      Modal.error({
        title: "Error",
        content: "Failed to get location. Please try again.",
      });
    }
  };

  const handleSetFinalClockOut = () => {
    if (!isClockedIn || !data?.[0]?.id) {
      Modal.error({
        title: "Error",
        content: "No attendance record found to set final clock-out.",
      });
      return;
    }
    console.log("Opening Final Clock Out Modal");
    setIsFinalClockOutModalVisible(true);
  };

  const handleFinalClockOutConfirm = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const payload = {
        clockOut: moment().format("HH:mm:ss a"),
        clockOutRemark: clockOutRemark || undefined,
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
      };

      console.log("Final Clock Out Payload:", payload);

      updateAttendance(
        { payload, id: data[0].id },
        {
          onSuccess: () => {
            console.log("Final Clock Out Success");
            refetch();
            setClockOutRemark("");
            setIsFinalClockOutModalVisible(false);
          },
          onError: (error) => console.error("Final Clock Out Error:", error),
        }
      );
    } catch (error) {
      console.error("Final Clock Out Location Error:", error);
      Modal.error({
        title: "Error",
        content: "Failed to set final clock-out. Please try again.",
      });
    }
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

      {/* Clock In Modal */}
      <Modal
        title="Confirm Clock In"
        open={isClockInModalVisible}
        onOk={handleClockInConfirm}
        onCancel={() => {
          console.log("Clock In Modal Cancelled");
          setIsClockInModalVisible(false);
          setClockInRemark("");
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to clock in now?</p>
        <Input
          placeholder="Enter a remark for clock-in (optional)"
          value={clockInRemark}
          onChange={(e) => {
            console.log("Clock In Remark Changed:", e.target.value);
            setClockInRemark(e.target.value);
          }}
          style={{ marginTop: 10 }}
          autoFocus
        />
      </Modal>

      {/* Normal Clock Out Modal */}
      <Modal
        title="Confirm Clock Out"
        open={isClockOutModalVisible}
        onOk={handleClockOutConfirm}
        onCancel={() => {
          console.log("Normal Clock Out Modal Cancelled");
          setIsClockOutModalVisible(false);
          setHistoryRemark("");
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to clock out now?</p>
        <Input
          placeholder="Enter a remark (optional)"
          value={historyRemark}
          onChange={(e) => {
            console.log("History Remark Changed:", e.target.value);
            setHistoryRemark(e.target.value);
          }}
          style={{ marginTop: 10 }}
          autoFocus
        />
      </Modal>

      {/* Final Clock Out Modal */}
      <Modal
        title="Set Final Clock Out"
        open={isFinalClockOutModalVisible}
        onOk={handleFinalClockOutConfirm}
        onCancel={() => {
          console.log("Final Clock Out Modal Cancelled");
          setIsFinalClockOutModalVisible(false);
          setClockOutRemark("");
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to set this as your final clock-out for the day?</p>
        <Input
          placeholder="Enter a remark for final clock-out (optional)"
          value={clockOutRemark}
          onChange={(e) => {
            console.log("Final Clock Out Remark Changed:", e.target.value);
            setClockOutRemark(e.target.value);
          }}
          style={{ marginTop: 10 }}
          autoFocus
        />
      </Modal>
    </>
  );
};

export default Clock;