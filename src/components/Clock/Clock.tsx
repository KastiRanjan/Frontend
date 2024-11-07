import { useCreateAttendence } from "@/hooks/attendence/useCreateAttendence";
import { useGetMyAttendence } from "@/hooks/attendence/useGetMyAttendence";
import { Button } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";

const Clock = () => {
  const { data } = useGetMyAttendence();
  const { mutate } = useCreateAttendence();
  const isClockedIn = data?.length > 0 ? true : false;
  const [timer, setTimer] = useState(0);
  console.log(timer)

  // State to manage location
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Get the user's location when they clock in or clock out
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

  // Timer for the clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation); // Store the location

      const payload = {
        date: moment().format("YYYY-MM-DD"),
        clockIn: moment().format("HH:mm:ss a"),
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
      };

      mutate(payload);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation); // Store the location

      const payload = {
        clockOut: moment().format("HH:mm:ss a"),
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
      };

      mutate(payload);
    } catch (error) {
      console.error("Error getting location:", error);
    }
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
      <div>
        Location:{" "}
        {location
          ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
          : "Fetching location..."}
      </div>
    </>
  );
};

export default Clock;
