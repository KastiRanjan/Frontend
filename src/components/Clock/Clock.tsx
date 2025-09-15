import { useCreateAttendence } from "@/hooks/attendence/useCreateAttendence";
import { useGetMyAttendence } from "@/hooks/attendence/useGetMyAttendence";
import { useUpdateAttendence } from "@/hooks/attendence/useUpdateAttendence";
import { Button, Modal, Input } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

const Clock = () => {
  const { data, refetch } = useGetMyAttendence();
  const { mutate: createAttendance, isPending: createPending } = useCreateAttendence();
  const { mutate: updateAttendance, isPending: updatePending } = useUpdateAttendence();
  const isClockedIn = data?.length > 0 ? true : false;
  const isClockedOut = isClockedIn && !!data?.[0]?.clockOut;
  const [clockInRemark, setClockInRemark] = useState<string>("");
  const [clockOutRemark, setClockOutRemark] = useState<string>("");
  const [historyRemark, setHistoryRemark] = useState<string>("");
  const [isClockInModalVisible, setIsClockInModalVisible] = useState(false);
  const [isClockOutModalVisible, setIsClockOutModalVisible] = useState(false);
  const [isFinalClockOutModalVisible, setIsFinalClockOutModalVisible] = useState(false);
  
  // Add state to prevent multiple clicks
  const [isProcessingClockIn, setIsProcessingClockIn] = useState(false);
  const [isProcessingClockOut, setIsProcessingClockOut] = useState(false);
  const [isProcessingFinalClockOut, setIsProcessingFinalClockOut] = useState(false);

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
    // Remove timer functionality as it's not used
  }, []);

  const handleClockIn = () => {
    if (isProcessingClockIn || createPending) return;
    setIsProcessingClockIn(true);
    setIsClockInModalVisible(true);
  };

  const handleClockInConfirm = async () => {
    if (createPending) return; // Prevent multiple clicks on confirm button
    
    try {
      const { latitude, longitude } = await getLocation();

      const payload = {
        date: moment().format("YYYY-MM-DD"),
        clockIn: moment().format("HH:mm:ss a"),
        clockInRemark: clockInRemark || undefined,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      };

      createAttendance(payload, {
        onSuccess: () => {
          refetch();
          setClockInRemark("");
          setIsClockInModalVisible(false);
          setIsProcessingClockIn(false);
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : "Failed to clock in";
          Modal.error({
            title: "Clock In Error",
            content: errorMessage,
          });
          setIsProcessingClockIn(false);
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get precise location. Please ensure location services are enabled.";
      Modal.error({
        title: "Error",
        content: errorMessage,
      });
      setIsProcessingClockIn(false);
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
      if (isProcessingClockOut || createPending) return;
      setIsProcessingClockOut(true);
      setIsClockOutModalVisible(true);
    }
  };

  const handleClockOutConfirm = async () => {
    if (createPending) return; // Prevent multiple clicks on confirm button
    
    try {
      const { latitude, longitude } = await getLocation();

      const payload = {
        clockOut: moment().format("HH:mm:ss a"),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        remark: historyRemark || undefined,
      };

      createAttendance(payload, {
        onSuccess: () => {
          refetch();
          setHistoryRemark("");
          setIsClockOutModalVisible(false);
          setIsProcessingClockOut(false);
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : "Failed to clock out";
          Modal.error({
            title: "Clock Out Error",
            content: errorMessage,
          });
          setIsProcessingClockOut(false);
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get precise location. Please ensure location services are enabled.";
      Modal.error({
        title: "Error",
        content: errorMessage,
      });
      setIsProcessingClockOut(false);
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
    if (isProcessingFinalClockOut || updatePending) return;
    setIsProcessingFinalClockOut(true);
    setIsFinalClockOutModalVisible(true);
  };

  const handleFinalClockOutConfirm = async () => {
    if (updatePending) return; // Prevent multiple clicks on confirm button
    
    try {
      const { latitude, longitude } = await getLocation();

      const payload = {
        clockOut: moment().format("HH:mm:ss a"),
        clockOutRemark: clockOutRemark || undefined,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      };

      updateAttendance(
        { payload, id: data[0].id },
        {
          onSuccess: () => {
            refetch();
            setClockOutRemark("");
            setIsFinalClockOutModalVisible(false);
            setIsProcessingFinalClockOut(false);
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : "Failed to set final clock-out";
            Modal.error({
              title: "Final Clock Out Error",
              content: errorMessage,
            });
            setIsProcessingFinalClockOut(false);
          },
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to set final clock-out. Please ensure location services are enabled.";
      Modal.error({
        title: "Error",
        content: errorMessage,
      });
      setIsProcessingFinalClockOut(false);
    }
  };

  return (
    <>
      <div>
        {!isClockedIn ? (
          <Button 
            type="primary" 
            shape="round" 
            onClick={handleClockIn}
            loading={createPending || isProcessingClockIn}
            disabled={createPending || isProcessingClockIn}
          >
            Clock In {moment().format("HH:mm:ss a")}
          </Button>
        ) : (
          <div>
            <Button
              type={isClockedOut ? "default" : "primary"}
              shape="round"
              onClick={handleClockOut}
              loading={createPending || isProcessingClockOut}
              disabled={createPending || updatePending || isProcessingClockOut || isProcessingFinalClockOut}
            >
              {isClockedOut ? "Clocked Out" : "Clock Out"} {moment().format("HH:mm:ss a")}
            </Button>
            {!isClockedOut && (
              <Button
                type="default"
                shape="round"
                onClick={handleSetFinalClockOut}
                style={{ marginLeft: 10 }}
                loading={updatePending || isProcessingFinalClockOut}
                disabled={createPending || updatePending || isProcessingClockOut || isProcessingFinalClockOut}
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
          setIsClockInModalVisible(false);
          setClockInRemark("");
          setIsProcessingClockIn(false);
        }}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={createPending}
        okButtonProps={{ disabled: createPending }}
        cancelButtonProps={{ disabled: createPending }}
      >
        <p>Are you sure you want to clock in now?</p>
        <Input
          placeholder="Enter a remark for clock-in (optional)"
          value={clockInRemark}
          onChange={(e) => {
            setClockInRemark(e.target.value);
          }}
          style={{ marginTop: 10 }}
          autoFocus
          disabled={createPending}
        />
      </Modal>

      {/* Normal Clock Out Modal */}
      <Modal
        title="Confirm Clock Out"
        open={isClockOutModalVisible}
        onOk={handleClockOutConfirm}
        onCancel={() => {
          setIsClockOutModalVisible(false);
          setHistoryRemark("");
          setIsProcessingClockOut(false);
        }}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={createPending}
        okButtonProps={{ disabled: createPending }}
        cancelButtonProps={{ disabled: createPending }}
      >
        <p>Are you sure you want to clock out now?</p>
        <Input
          placeholder="Enter a remark (optional)"
          value={historyRemark}
          onChange={(e) => {
            setHistoryRemark(e.target.value);
          }}
          style={{ marginTop: 10 }}
          autoFocus
          disabled={createPending}
        />
      </Modal>

      {/* Final Clock Out Modal */}
      <Modal
        title="Set Final Clock Out"
        open={isFinalClockOutModalVisible}
        onOk={handleFinalClockOutConfirm}
        onCancel={() => {
          setIsFinalClockOutModalVisible(false);
          setClockOutRemark("");
          setIsProcessingFinalClockOut(false);
        }}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={updatePending}
        okButtonProps={{ disabled: updatePending }}
        cancelButtonProps={{ disabled: updatePending }}
      >
        <p>Are you sure you want to set this as your final clock-out for the day?</p>
        <Input
          placeholder="Enter a remark for final clock-out (optional)"
          value={clockOutRemark}
          onChange={(e) => {
            setClockOutRemark(e.target.value);
          }}
          style={{ marginTop: 10 }}
          autoFocus
          disabled={updatePending}
        />
      </Modal>
    </>
  );
};

export default Clock;