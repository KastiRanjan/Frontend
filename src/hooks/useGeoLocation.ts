import { useState, useEffect } from "react";
import axios from "axios";

export const useGeoLocation = () => {
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    displayName: string | null;
    country: string | null;
  }>({
    latitude: null,
    longitude: null,
    displayName: null,
    country: null,
  });

  useEffect(() => {
    const handleSuccess = (position: GeolocationPosition) => {
      axios
        .get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
        ,{
            withCredentials: false
        })
        .then((response) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            displayName: response.data.display_name,
            country: response.data.address.country,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error(error);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  return location;
};

