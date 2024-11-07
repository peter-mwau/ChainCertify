import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Create an Axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  },
  });

  console.log("Base URL: ", import.meta.env.VITE_API_BASE_URL);

    // Add a request interceptor to attach the access token to all requests
    api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

  // Add an interceptor to handle the refresh token
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If access token is expired
      if (error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try refreshing the access token
          const { data } = await api.post('/api/refresh');
          const newAccessToken = data.accessToken;

          // Update the access token in your application context
          setAccessToken(newAccessToken);

          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Refresh token expired or invalid:', refreshError);
          logout(); // Call the logout function from context
          return Promise.reject(refreshError);
        }
      }

       // If unauthorized, log out the user
       if (error.response.status === 401) {
        logout();
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (accessToken) {
      const getUserProfile = async () => {
        try {
          const response = await api.get('/api/users/profile', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUser(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          logout();
        } finally {
          setLoading(false);
        }
      };
  
      getUserProfile();
    } else {
      setUser('');
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []); // Add api as well, since api could be changed.
  

  if (loading) {
    return <div>Loading...</div>;
  }

  const login = async (accessToken) => {
    setAccessToken(accessToken);
    setIsLoggedIn(true);
    console.log("Token set on login:", accessToken);

    try {
      const response = await api.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(response.data);
      console.log("User set useEffect on login:", response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout(); // Logout if fetching user profile fails
    }
  };


const logout = async () => {
    console.log("Logging out");

    try {
        // Call the backend to logout the user
        const response = await api.post('/api/logout', {
            userId: user.id,  // Assuming `user` object has `id`
        });

        if (response.status === 200) {
            console.log("Successfully logged out on the backend");

            // Clear the frontend state after successful backend logout
            setIsLoggedIn(false);
            setUser('');
            setAccessToken('');

            console.log("State cleared, redirecting to login...");
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } else {
            console.error('Logout failed:', response.data.error);
        }
    } catch (error) {
        console.error('An error occurred during logout:', error.response?.data?.error || error.message);
    }
};


  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/api/refresh');
      const newAccessToken = response.data.accessToken;
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, login, logout, refreshAccessToken, accessToken, api }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);