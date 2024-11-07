import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";

const Overview = () => {
  const { api } = useAuth();
  const [userSize, setUserSize] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [assignmentSize, setAssignmentSize] = useState(0);
  const [quizzesSize, setQuizzesSize] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [loading, setLoading ] = useState(false);
  
  // Function to fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/users");
      const users = response.data;

      // Calculate total users, admins, and students
      setUserSize(users.length);
      const admins = users.filter(user => user.role === "ADMIN").length;
      const students = users.filter(user => user.role === "STUDENT").length;
      
      setAdminCount(admins);
      setStudentCount(students);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to fetch all assignments and count total submissions
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/assignments");
      const assignments = response.data;

      setAssignmentSize(assignments.length);

      // Calculate the total number of submissions across all assignments
      const totalSubmissionsCount = assignments.reduce((acc, assignment) => {
        return acc + assignment.submissions.length;
      }, 0);
      
      setTotalSubmissions(totalSubmissionsCount);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Function to fetch all quizzes
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/quizzes");
      const quizzes = response.data;
      setQuizzesSize(quizzes.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAssignments();
    fetchQuizzes();
  }, []); // Empty array ensures the function runs only once when the component mounts

  if(!loading){
    <div>Loading...</div>
  }

  return (
    <div className="mx-auto container justify-center items-center">
      <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">Dashboard Overview</h2>
      
      {/* Active Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Total Users</h3>
          <p className="text-2xl">{userSize}</p>
          <div className="flex flex-row justify-around">
            <p className="text-sm text-gray-600 dark:text-gray-700">Admins: {adminCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-700">Students: {studentCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Total Assignments</h3>
          <p className="text-2xl">{assignmentSize}</p>
          <p className="text-sm text-gray-600 dark:text-gray-700">Total Submissions: {totalSubmissions}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Total Quizzes</h3>
          <p className="text-2xl">{quizzesSize}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Reports Generated</h3>
          <p className="text-2xl">10</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Settings</h3>
          <p className="text-2xl">Configured</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
