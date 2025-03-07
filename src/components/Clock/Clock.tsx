import { useCreateAttendence } from "@/hooks/attendence/useCreateAttendence";
import { useGetMyAttendence } from "@/hooks/attendence/useGetMyAttendence";
import { Button, Modal } from "antd"; // Added Modal import
import moment from "moment";
import { useEffect, useState } from "react";

const Clock = () => {
  const { data } = useGetMyAttendence();
  const { mutate } = useCreateAttendence();
  const isClockedIn = data?.length > 0 ? true : false;
  const [timer, setTimer] = useState(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
            clockIn: moment().format("HH:mm:ss a"),
            latitude: currentLocation.latitude.toString(),
            longitude: currentLocation.longitude.toString(),
          };

          mutate(payload);
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

  const handleClockOut = async () => {
    Modal.confirm({
      title: "Confirm Clock Out",
      content: "Are you sure you want to clock out now?",
      onOk: async () => {
        try {
          const currentLocation = await getLocation();
          setLocation(currentLocation);

          const payload = {
            clockOut: moment().format("HH:mm:ss a"),
            latitude: currentLocation.latitude.toString(),
            longitude: currentLocation.longitude.toString(),
          };

          mutate(payload);
        } catch (error) {
          console.error("Error getting location:", error);
          Modal.error({
            title: "Error",
            content: "Failed to get location. Please try again.",
          });
        }
      },
      onCancel: () => {
        console.log("Clock out cancelled");
      },
    });
  };

  return (
    <>
      <div>
        {isClockedIn ? (
          <Button type="primary" shape="round" onClick={handleClockOut}>
            Clock Out {moment().format("hh:mm:ss a")}
          </Button>
        ) : (
          <Button type="primary" shape="round" onClick={handleClockIn}>
            Clock In {moment().format("hh:mm:ss a")}
          </Button>
        )}
      </div>
    </>
  );
};

export default Clock;