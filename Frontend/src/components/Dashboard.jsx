// Dashboard.jsx
import { useContext, useRef, useEffect } from "react";
import { UserContext } from "../contexts/userContext"; // Adjust import according to your structure
import { QuizContext } from "../contexts/quizContext";
import { AssignmentContext } from "../contexts/assignmentContext";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Accessing context data
  const { user } = useContext(UserContext);
  const { quiz } = useContext(QuizContext);
  const { assignments } = useContext(AssignmentContext);

  // Reference for the chart
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);

  // Sample data for visualizations
  const quizCount = quiz.length; // Number of quizzes
  const assignmentCount = assignments.length; // Number of assignments

  // Example data for Bar Chart
  const barData = {
    labels: ["Quizzes", "Assignments"],
    datasets: [
      {
        label: "Total Count",
        data: [quizCount, assignmentCount],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  // Example data for Line Chart
  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"], // Replace with your data
    datasets: [
      {
        label: "Quizzes Completed",
        data: [12, 19, 3, 5], // Replace with your actual data
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  useEffect(() => {
    // Clean up function to destroy the chart instance if it exists
    return () => {
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="p-5 w-full md:w-[70%] md:mx-auto md:ml-[240px] lg:w-[60%] lg:mx-auto transition-all duration-1000">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Total Quizzes & Assignments</h3>
          <Bar
            ref={barChartRef}
            data={barData}
            options={{ scales: { y: { beginAtZero: true } } }}
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Quizzes Completed Over Time</h3>
          <Line
            ref={lineChartRef}
            data={lineData}
            options={{ scales: { y: { beginAtZero: true } } }}
          />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">User Info:</h3>
        <p>Name: {user?.name || "Guest"}</p>
        <p>Email: {user?.email || "N/A"}</p>
        <p>Role: {user?.role || "N/A"}</p>
      </div>
    </div>
  );
};

export default Dashboard;
