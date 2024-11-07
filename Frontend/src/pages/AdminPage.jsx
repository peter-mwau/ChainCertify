import { useState } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import ManageUsers from "../components/ManageUsers";
import ManageAssignments from "../components/ManageAssignments";
import ManageQuizzes from "../components/ManageQuizess";
import Reports from "../components/Reports";
import Settings from "../components/Settings";
import Overview from "../components/Overview";
import ManageProjects from "../components/ManageProjects";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "manage-users":
        return <ManageUsers />;
      case "manage-assignments":
        return <ManageAssignments />;
      case "manage-quizzes":
        return <ManageQuizzes />;
      case "manage-projects":
        return <ManageProjects />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex transition-all duration-300">
      <button
        className="p-2 text-gray-200 block z-10 fixed mt-[70vh] md:hidden lg:hidden"
        onClick={toggleSidebar}
      >
        <GoSidebarCollapse
          size={24}
          className={`${
            isSidebarVisible
              ? "dark:text-gray-100 text-gray-900"
              : "text-gray-900 font-semibold dark:text-white"
          }`}
        />
      </button>

      {/* Sidebar */}
      <div
        className={`w-64 h-screen bg-white dark:bg-cyan-900 text-white pt-[100px] fixed transition-transform duration-300 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300">
            Admin Panel
          </h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li
              className={`p-4 cursor-pointer text-gray-800 dark:text-gray-200 ${
                activeSection === "overview"
                  ? "bg-gray-100 text-gray-700 font-semibold dark:bg-cyan-700"
                  : "hover:bg-gray-100 hover:text-gray-800 hover:font-semibold hover:dark:bg-cyan-900"
              }`}
              onClick={() => setActiveSection("overview")}
            >
              Overview
            </li>
            <li
              className={`p-4 cursor-pointer text-gray-800 dark:text-gray-200 ${
                activeSection === "manage-users"
                  ? "bg-gray-100 text-gray-700 font-semibold dark:bg-cyan-700"
                  : "hover:bg-gray-100 hover:text-gray-800 hover:font-semibold hover:dark:bg-cyan-900"
              }`}
              onClick={() => setActiveSection("manage-users")}
            >
              Manage Users
            </li>
            <li
              className={`p-4 cursor-pointer text-gray-800 dark:text-gray-200 ${
                activeSection === "manage-assignments"
                  ? "bg-gray-100 text-gray-700 font-semibold dark:bg-cyan-700"
                  : "hover:bg-gray-100 hover:text-gray-800 hover:font-semibold hover:dark:bg-cyan-900"
              }`}
              onClick={() => setActiveSection("manage-assignments")}
            >
              Manage Assignments
            </li>
            <li
              className={`p-4 cursor-pointer text-gray-800 dark:text-gray-200 ${
                activeSection === "manage-quizzes"
                  ? "bg-gray-100 text-gray-700 font-semibold dark:bg-cyan-700"
                  : "hover:bg-gray-100 hover:text-gray-800 hover:font-semibold hover:dark:bg-cyan-900"
              }`}
              onClick={() => setActiveSection("manage-quizzes")}
            >
              Manage Quizzes
            </li>
            <li
              className={`p-4 cursor-pointer text-gray-800 dark:text-gray-200 ${
                activeSection === "manage-projects"
                  ? "bg-gray-100 text-gray-700 font-semibold dark:bg-cyan-700"
                  : "hover:bg-gray-100 hover:text-gray-800 hover:font-semibold hover:dark:bg-cyan-900"
              }`}
              onClick={() => setActiveSection("manage-projects")}
            >
              Manage Projects
            </li>
            <li
              className={`p-4 cursor-pointer text-gray-800 dark:text-gray-200 ${
                activeSection === "reports"
                  ? "bg-gray-100 text-gray-700 font-semibold dark:bg-cyan-700"
                  : "hover:bg-gray-100 hover:text-gray-800 hover:font-semibold dark:hover:bg-cyan-900"
              }`}
              onClick={() => setActiveSection("reports")}
            >
              Reports
            </li>
            <li
              className={`p-4 cursor-pointer text-gray-800 dark:text-gray-200 ${
                activeSection === "settings"
                  ? "bg-gray-100 text-gray-700 font-semibold dark:bg-cyan-700"
                  : "hover:bg-gray-100 hover:text-gray-800 hover:font-semibold hover:dark:bg-cyan-900"
              }`}
              onClick={() => setActiveSection("settings")}
            >
              Settings
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 p-10 bg-gray-100 pt-[100px] pl-[300px] dark:bg-cyan-700 transition-all duration-1000 ${
          isSidebarVisible ? "opacity-100" : "opacity-50"
        } h-[100vh] max-h-[100vh] overflow-y-auto`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
