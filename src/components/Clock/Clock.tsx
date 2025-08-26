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
  const [isFinalClockOutModalVisible, setIsFinalClockOutModalVisible] = useState(false);

  const getLocation = () => {
    return new Promise<{ latitude: number; longitude: number; accuracy: number }>(
      async (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
          return;
        }

        const tryGetPosition = (attempt = 1, maxAttempts = 3) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const accuracy = position.coords.accuracy;
              console.log(`Attempt ${attempt} - Location Accuracy: ${accuracy} meters`);

              if (accuracy <= 500) {
                // If accuracy is good, resolve immediately
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                });
              } else if (attempt < maxAttempts) {
                // If accuracy is low and more attempts remain, wait and retry
                setTimeout(() => tryGetPosition(attempt + 1, maxAttempts), 2000); // Wait 2 seconds before retrying
              } else {
                // If max attempts reached, reject with the last result
                reject(new Error(`Could not get precise location. Best accuracy: ${accuracy} meters`));
              }
            },
            (error) => {
              reject(error);
            },
            {
              enableHighAccuracy: true, // Use GPS for high accuracy
              timeout: 10000, // Wait up to 10 seconds per attempt
              maximumAge: 0, // No cached data
            }
          );
        };

        tryGetPosition(); // Start the first attempt
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
      const { latitude, longitude, accuracy } = await getLocation();
      setLocation({ latitude, longitude });
      console.log(`Clock In Final Location Accuracy: ${accuracy} meters`);

      const payload = {
        date: moment().format("YYYY-MM-DD"),
        clockIn: moment().format("HH:mm:ss a"),
        clockInRemark: clockInRemark || undefined,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
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
        content:
          error.message || "Failed to get precise location. Please ensure location services are enabled.",
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
      const { latitude, longitude, accuracy } = await getLocation();
      setLocation({ latitude, longitude });
      console.log(`Normal Clock Out Final Location Accuracy: ${accuracy} meters`);

      const payload = {
        clockOut: moment().format("HH:mm:ss a"),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
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
        content:
          error.message || "Failed to get precise location. Please ensure location services are enabled.",
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
      const { latitude, longitude, accuracy } = await getLocation();
      setLocation({ latitude, longitude });
      console.log(`Final Clock Out Final Location Accuracy: ${accuracy} meters`);

      const payload = {
        clockOut: moment().format("HH:mm:ss a"),
        clockOutRemark: clockOutRemark || undefined,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
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
        content:
          error.message || "Failed to set final clock-out. Please ensure location services are enabled.",
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