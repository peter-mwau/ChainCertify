import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QuizContext } from "../contexts/quizContext";
import TakeQuiz from "../components/TakeQuiz";
import { UserContext } from "../contexts/userContext";
import { useAuth } from "../contexts/authContext";
import Contact from "./Contact";
import { AssignmentContext } from "../contexts/assignmentContext";
import TakeAssignment from "../components/TakeAssignment";
import { GoSidebarCollapse } from "react-icons/go";
import { IoNavigateSharp } from "react-icons/io5";
import Projects from "../components/Projects";
import Reports from "../components/Reports";
import Dashboard from "../components/Dashboard";

const Home = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { quiz } = useContext(QuizContext);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const { user, setUser } = useContext(UserContext); // Access setUser to update user state
  const { api, logout, isLoggedIn } = useAuth();
  const [previewImage, setPreviewImage] = useState(null);
  const { assignments } = useContext(AssignmentContext);
  const [submissions, setSubmissions] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  console.log("Quiz: ", quiz);

  useEffect(() => {
    // Fetch all assignment submissions and grading info
    const fetchSubmissions = async () => {
      try {
        const response = await api.get("/api/assignment-submissions");
        setSubmissions(response.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  // State to track editing mode
  const [isEditing, setIsEditing] = useState(false);

  const BASE_URL = "http://127.0.0.1:8080";

  console.log("Path: ", `${BASE_URL}${previewImage}`);

  const avatar = user?.profileImage
    ? `${BASE_URL}${previewImage}`
    : `${BASE_URL}/uploads/Africa1.jpg`;

  // Local state to hold editable fields
  const [updatedUser, setUpdatedUser] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    profileImage: null,
  });

  useEffect(() => {
    if (user?.profileImage) {
      setPreviewImage(user.profileImage);
    }
  }, [user]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0]; // Assuming the user uploads a single image
      const imageUrl = URL.createObjectURL(file); // Create a URL for the uploaded image
      setUpdatedUser((prevUser) => ({
        ...prevUser,
        profileImage: imageUrl,
      }));
    } else {
      setUpdatedUser((prevUser) => ({
        ...prevUser,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUpdatedUser((prevUser) => ({
        ...prevUser,
        profileImage: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle form submission (update user details)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", updatedUser.name);
    formData.append("email", updatedUser.email);
    formData.append("role", updatedUser.role);

    if (updatedUser.profileImage) {
      formData.append("profileImage", updatedUser.profileImage);
    }

    try {
      const response = await api.put(`/api/users/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const updatedUserData = response.data;
        setUser(updatedUserData);
        setIsEditing(false);
        if (updatedUserData.profileImage) {
          setPreviewImage(updatedUserData.profileImage);
        }
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-300 dark:bg-blue-950 transition-all duration-1000">
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
        className={`bg-white dark:bg-cyan-900 w-64 h-full p-5 pt-[100px] fixed transition-all duration-1000 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-lg font-bold mb-4 dark:text-gray-300">Dashboard</h2>
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className={`block p-2 rounded transition-colors ${
                activeSection === "dashboard"
                  ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className={`block p-2 rounded transition-colors ${
                activeSection === "quizzes"
                  ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
              }`}
              onClick={() => setActiveSection("quizzes")}
            >
              Available Quizzes
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className={`block p-2 rounded transition-colors ${
                activeSection === "assignments"
                  ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
              }`}
              onClick={() => setActiveSection("assignments")}
            >
              Assignments
            </Link>
          </li>
          {user?.role === "STUDENT" && (
            <>
              <li>
                <Link
                  to="/"
                  className={`block p-2 rounded transition-colors ${
                    activeSection === "projects"
                      ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
                  }`}
                  onClick={() => setActiveSection("projects")}
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={`block p-2 rounded transition-colors ${
                    activeSection === "reports"
                      ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
                  }`}
                  onClick={() => setActiveSection("reports")}
                >
                  Reports
                </Link>
              </li>
            </>
          )}
          {user?.role === "ADMIN" && (
            <li>
              <Link
                to="/admin"
                className={`block p-2 rounded transition-colors ${
                  activeSection === "admin"
                    ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
                }`}
                onClick={() => setActiveSection("admin")}
              >
                Admin Page
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/"
              className={`block p-2 rounded transition-colors ${
                activeSection === "profile"
                  ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
              }`}
              onClick={() => setActiveSection("profile")}
            >
              User Profile
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className={`block p-2 rounded transition-colors ${
                activeSection === "contact"
                  ? "bg-gray-300 text-gray-800 dark:bg-cyan-700 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-cyan-700"
              }`}
              onClick={() => setActiveSection("contact")}
            >
              Contact Us
            </Link>
          </li>
          {isLoggedIn ? (
            <li
              onClick={logout}
              className="p-2 cursor-pointer text-red-500 hover:bg-gray-200 rounded-md hover:font-semibold"
            >
              Logout
            </li>
          ) : (
            <li className="p-2 cursor-pointer text-gray-800 dark:text-yellow-500 font-semibold hover:bg-gray-200 dark:hover:bg-transparent dark:hover:shadow-md dark:hover:shadow-white rounded-md hover:font-semibold">
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
        <div className="lg:mt-[45vh] mt-[33vh] md:mt-[33vh]">
          <hr />
          <div
            onClick={() => setActiveSection("profile")}
            className="flex flex-row gap-2 my-2 justify-around p-2 hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-transparent dark:hover:shadow-md dark:hover:shadow-white rounded-md"
          >
            <img
              src={avatar}
              className="w-10 h-10 rounded-full object-cover my-auto text-center mx-auto border-2 p-1 border-yellow-500"
            />
            <p className="my-auto text-sm text-center font-bold text-gray-900 dark:text-yellow-500">
              @{isLoggedIn ? user?.name : "Guest"}
            </p>
            <IoNavigateSharp className="dark:text-yellow-500 my-auto text-gray-900 w-10" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 h-[100vh] overflow-auto bg-gray-300 dark:bg-cyan-700 text-gray-900 dark:text-white transition-all duration-1000 pt-[100px]">
        <div className="font-semibold text-3xl text-center md:ml-[130px]">
          Welcome Home,{" "}
          {isLoggedIn ? (
            <span className="text-yellow-500 italic">{user?.name}!!</span>
          ) : (
            <span className="text-yellow-500 italic"> Guest!!</span>
          )}
        </div>

        {/* Render content based on the active section */}
        {activeSection === "dashboard" && (
          // <p className="mt-4 mx-auto container justify-center lg:mx-auto items-center  md:w-[80%] md:ml-[250px]">
          //   Dashboard is under construction!
          // </p>
          <Dashboard />
        )}

        {activeSection === "quizzes" && (
          <div className="mt-4 mx-auto container justify-center items-center md:w-[80%] md:ml-[250px]">
            <h3 className="text-2xl font-bold lg:ml-[150px]">
              Available Quizzes
            </h3>
            <ul className="space-y-4 mt-4">
              {quiz.map((currentQuiz) => {
                // Filter quiz attempts for the logged-in user
                const userAttempts = currentQuiz.quizAttempts.filter(
                  (attempt) => attempt.userId === user.id
                );

                // Count the number of attempts
                const numberOfAttempts = userAttempts.length;

                // Get the maximum score from the last three attempts
                const maxScore =
                  userAttempts.length > 0
                    ? Math.max(...userAttempts.map((attempt) => attempt.score))
                    : 0;

                // Get the grading and feedback from the latest quiz attempt
                const latestAttempt = userAttempts[userAttempts.length - 1]; // Get the last attempt
                const latestGrading = latestAttempt?.grading || [];

                // Determine if the Start Quiz button should be disabled
                const quizAttemptLimitReached = numberOfAttempts >= 3;

                return (
                  <li
                    key={currentQuiz.id}
                    className="border p-4 rounded bg-white dark:bg-transparent w-full lg:mx-auto md:w-[80%] shadow-md dark:shadow-white"
                  >
                    <h4 className="text-xl font-semibold">
                      {currentQuiz.title}
                    </h4>
                    <p>{currentQuiz.description}</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Number of Questions: {currentQuiz.questions.length}
                    </p>

                    {user?.role === "STUDENT" && isLoggedIn && (
                      <>
                        <div className="mt-2">
                          <p className="italic text-sm text-gray-500 dark:text-gray-300">
                            Attempts: {numberOfAttempts}/3
                          </p>
                        </div>
                        {/* Display Grade and Feedback */}
                        {latestAttempt?.score ? (
                          <>
                            <div className="flex justify-between items-center my-4">
                              <span
                                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                                  latestAttempt.score > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                Grade: {maxScore}%
                              </span>
                            </div>
                            <div className="flex flex-col gap-4">
                              <strong className="dark:text-gray-300">
                                Feedback:
                              </strong>
                              <span className="text-green-500 italic">
                                {latestGrading.length > 0 &&
                                latestGrading[0].feedback ? (
                                  latestGrading[0].feedback
                                ) : (
                                  <span className="text-red-600 dark:text-red-500 italic">
                                    No feedback provided.
                                  </span>
                                )}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center my-4">
                            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                              Not Graded
                            </span>
                          </div>
                        )}

                        {/* Disable Start Quiz button if max attempts reached */}
                        <button
                          className={`text-yellow-500 hover:underline mt-2 block ${
                            quizAttemptLimitReached
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => {
                            if (!quizAttemptLimitReached) {
                              setSelectedQuiz(currentQuiz); // Set the selected quiz
                              setActiveSection("takeQuiz"); // Switch to takeQuiz section
                            }
                          }}
                          disabled={quizAttemptLimitReached}
                        >
                          {quizAttemptLimitReached ? (
                            <span className="text-red-500 dark:text-red-300">
                              Max Attempts Reached, Try again after 12hrs.
                            </span>
                          ) : (
                            "Start Quiz"
                          )}
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activeSection === "takeQuiz" &&
          selectedQuiz && ( // Render TakeQuiz only if a quiz is selected
            <TakeQuiz quizz={[selectedQuiz]} />
          )}

        {activeSection === "reports" && <Reports />}

        {/*contact us page */}
        {activeSection === "contact" && <Contact />}

        {/* user profile with update functionalities */}
        {activeSection === "profile" && (
          <div className="mt-4 lg:w-[60%] md:w-[70%] md:ml-[250px] shadow-cyan-950 lg:mx-auto md:mx-auto shadow-md rounded-md dark:shadow-white p-5 mx-auto">
            <h3 className="text-2xl font-bold text-center py-5">
              User Profile
            </h3>

            {/* If not in edit mode, display the profile */}
            {!isEditing ? (
              <div className="mx-auto items-center justify-center">
                <img
                  src={avatar}
                  // alt={`${user.name}'s profile`}
                  className="w-32 h-32 rounded-full object-cover text-center mx-auto border-2 p-2 border-yellow-500"
                />
                <div className="flex flex-col">
                  <p className="mt-4 text-2xl text-center font-bold text-gray-900 dark:text-yellow-500">
                    @{isLoggedIn ? user?.name : "Guest"}
                  </p>
                  <div className="flex flex-col md:flex-row lg:flex-row gap-4 p-4 justify-around">
                    <p className="text-lg text-gray-600 font-semibold dark:text-gray-300">
                      {isLoggedIn ? user?.email : "N/A"}
                    </p>
                    <p className="text-lg text-gray-600 font-semibold lowercase dark:text-gray-300">
                      {isLoggedIn ? user?.role : "N/A"}
                    </p>
                    <p className="text-lg text-gray-600 font-semibold dark:text-gray-300">
                      Login Status:{" "}
                      <span className="text-green-600">
                        {/* {user?.loggedIn ? "Logged In" : "Logged Out"} */}
                        {isLoggedIn ? "Logged In" : "Logged Out"}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  className="mt-4 bg-cyan-950 dark:bg-yellow-500 text-white py-2 px-4 rounded"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              // If in edit mode, display the form
              <form
                className="mt-4"
                onSubmit={handleFormSubmit}
                encType="multipart/form-data"
              >
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full mt-4"
                    />
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={updatedUser.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-400 dark:text-gray-900 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={updatedUser.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-400 dark:text-gray-900 rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="ml-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        {activeSection === "assignments" && (
          <>
            <div className="mx-auto container justify-center md:ml-[200px] items-center md:w-[80%]">
              <p className="mt-4 text-2xl py-4 font-semibold lg:ml-[150px] md:ml-[80px] text-gray-800 dark:text-gray-200">
                Available Assignments
              </p>

              {/* Loop through assignments */}
              {assignments.map((assignment) => {
                const isDeadlinePassed =
                  new Date(assignment.deadline) < new Date();

                // Check if the current user has submitted this assignment
                const userSubmission = submissions.find(
                  (submission) =>
                    submission.assignmentId === assignment.id &&
                    submission.userId === user?.id
                );

                return (
                  <div
                    key={assignment.id}
                    className="border p-4 rounded bg-white dark:bg-transparent space-y-3 m-3 w-full mx-auto md:w-[80%] lg:w-[80%] shadow-md dark:shadow-white"
                  >
                    <div className="flex flex-row justify-between my-auto mx-auto">
                      <h4 className="text-xl font-semibold">
                        {assignment.title}
                      </h4>

                      <p
                        className={`text-gray-600 dark:text-gray-300 font-semibold my-auto ${
                          isDeadlinePassed
                            ? "text-red-500 dark:text-red-500"
                            : "text-green-500 dark:text-green-600"
                        }`}
                      >
                        Due Date:{" "}
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <p>{assignment.description}</p>

                    {/* Display different views based on user status */}
                    {user?.role === "STUDENT" && isLoggedIn && (
                      <>
                        {/* If the assignment has been submitted */}
                        {userSubmission ? (
                          <div className="py-4">
                            <p className="text-gray-600 dark:text-gray-300">
                              <strong>Submission:</strong>{" "}
                              {userSubmission.content}
                            </p>
                            <div className="flex justify-between items-center my-4">
                              <span
                                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                                  userSubmission.grading &&
                                  userSubmission.grading.length > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {userSubmission.grading &&
                                userSubmission.grading.length > 0
                                  ? `Grade: ${userSubmission.grading[0].grade}%`
                                  : "Not Graded"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-4">
                              <strong className="dark:text-gray-300">
                                Feedback:
                              </strong>
                              <span className="text-green-500 italic">
                                {userSubmission.grading &&
                                userSubmission.grading.length > 0
                                  ? userSubmission.grading[0].feedback ||
                                    "No feedback provided."
                                  : "No feedback provided."}
                              </span>
                              <span className="font-semibold text-lg dark:text-gray-300">
                                File Submission
                              </span>
                              {userSubmission.file ? (
                                <a
                                  href={`${BASE_URL}/uploads/assignments/${userSubmission.file}`}
                                  className="text-yellow-500 hover:cursor-pointer hover:underline"
                                >
                                  {userSubmission.file}
                                </a>
                              ) : (
                                <span className="text-red-500">
                                  No file submitted
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* If no submission has been made and the deadline is not passed */
                          <>
                            {isDeadlinePassed ? (
                              <p className="text-red-500 dark:text-red-500">
                                No further submissions allowed
                              </p>
                            ) : (
                              <button
                                className="text-blue-500 hover:text-blue-700 pt-10 hover:underline dark:text-yellow-500"
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setActiveSection("TakeAssignment");
                                }}
                              >
                                Submit Assignment
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* For non-logged in users */}
                    {!user?.loggedIn && (
                      <p className="text-gray-500 dark:text-gray-300">
                        Please log in to submit assignments.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeSection === "TakeAssignment" && selectedAssignment && (
          <TakeAssignment assignment={selectedAssignment} />
        )}

        {activeSection === "projects" && (
          <div className="mt-4 mx-auto container justify-center lg:mx-auto items-center  md:w-[80%] md:ml-[250px]">
            {isLoggedIn ? (
              <Projects />
            ) : (
              <h3 className="text-md md:ml-[50px]">
                Projects is under construction!
              </h3>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
