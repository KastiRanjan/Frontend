import { useMutation } from "@tanstack/react-query";
import { login } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      console.log('Login response:', response);
      
      // Extract the Authentication token from response headers or cookies
      const authToken = response.headers['set-cookie']?.find(cookie => cookie.startsWith('Authentication='));
      
      // If we can directly access the token, store it in localStorage
      if (authToken) {
        const tokenValue = authToken.split('=')[1].split(';')[0];
        localStorage.setItem('access_token', tokenValue);
        console.log('Token stored in localStorage');
      } else {
        // Fallback - use document.cookie to extract the token since it's already set by the backend
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('Authentication='));
        
        if (authCookie) {
          const tokenValue = authCookie.trim().split('=')[1];
          localStorage.setItem('access_token', tokenValue);
          console.log('Token extracted from cookies and stored in localStorage');
        } else {
          console.warn('Could not extract Authentication token from cookies');
        }
      }
      
      navigate("/");
    },
  });
};
