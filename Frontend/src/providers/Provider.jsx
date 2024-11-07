import { useState, useEffect, useCallback } from "react";
import { DarkModeProvider } from '../contexts/themeContext';
import { UserContext } from "../contexts/userContext";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/authContext';
import { QuizContext } from "../contexts/quizContext";
import { AssignmentContext } from "../contexts/assignmentContext";

export default function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshAccessToken, accessToken, api } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [assignments, setAssignments] = useState(null);

  // Function to get user details
  const getUser = useCallback(async () => {
    if (!accessToken) {
      console.log("Access token is missing");
      return;
    }

    try {
      const response = await api.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          getUser();
        } else {
          navigate("/login");
        }
      }
    }
  }, [accessToken, api, refreshAccessToken, navigate]);

  // Function to fetch all quizzes
  const getQuizes = useCallback(async () => {
    try {
      const response = await api.get("/api/quizzes");
      setQuiz(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, [api]);

  // Fetch all assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const response = await api.get("/api/assignments");
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }, [api]);

  // Function to refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([getQuizes(), getUser(), fetchAssignments()]);
  }, [getQuizes, getUser, fetchAssignments]);

  // Initial data load
  useEffect(() => {
    refreshAllData().then(() => setLoading(false));
  }, [refreshAllData]);

  // Set up polling interval for real-time updates
  useEffect(() => {
    // Poll every 30 seconds for updates
    const pollInterval = setInterval(() => {
      refreshAllData();
    }, 30000);

    // Clean up interval on unmount
    return () => clearInterval(pollInterval);
  }, [refreshAllData]);

  // Set up visibility change listener to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAllData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshAllData]);

  // Set up focus listener to refresh data when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      refreshAllData();
    };

    window.addEventListener('focus', handleFocus);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshAllData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DarkModeProvider>
      <UserContext.Provider value={{ user, setUser, loading, refreshData: refreshAllData }}>
        <QuizContext.Provider value={{ quiz, setQuiz, refreshQuizzes: getQuizes }}>
          <AssignmentContext.Provider value={{ assignments, setAssignments, refreshAssignments: fetchAssignments }}>
            {children}
          </AssignmentContext.Provider>
        </QuizContext.Provider>
      </UserContext.Provider>
    </DarkModeProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node,
};