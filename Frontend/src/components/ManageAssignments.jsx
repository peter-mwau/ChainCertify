import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import GradingModal from "./GradingModal";

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]); // State for submissions
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const { api } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [assignmentId, setAssignmentId] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubmission(null);
  };

  console.log("Submissions: ", submissions);

  const handleOpenModal = (submission) => {
    setCurrentSubmission(submission);
    setIsModalOpen(true);
  };

  const handleGradeSubmission = (id, grade, feedback) => {
    // Logic to handle grading, e.g., update submission state or make API call
    console.log("Grading Submission:", { id, grade, feedback });
  };

  const BASE_URL = "http://127.0.0.1:8080";

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Fetch all assignments
  const fetchAssignments = async () => {
    try {
      const response = await api.get("/api/assignments");
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch all assignment submissions
  const fetchSubmissions = async () => {
    try {
      const response = await api.get("/api/assignment-submissions");
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  // Fetch assignment by ID when an assignment is clicked
  const handleFetchAssignmentById = async (id) => {
    try {
      const response = await api.get(`/api/assignment/${id}`);
      setSelectedAssignment(response.data);
    } catch (error) {
      console.error("Error fetching assignment by ID:", error);
    }
  };

  // Handle input changes for the form
  const handleChange = (e) => {
    setNewAssignment({
      ...newAssignment,
      [e.target.name]: e.target.value,
    });
  };

  // Handle adding new assignment
  const handleAddAssignment = async () => {
    const { title, description, dueDate } = newAssignment;
    const userId = 1; // Replace with actual userId

    try {
      const response = await api.post("/api/create-assignment", {
        title,
        description,
        dueDate,
        userId,
      });

      setAssignments([...assignments, response.data]);
      setSuccess("Assignment created successfully!");
      setNewAssignment({ title: "", description: "", dueDate: "" });
    } catch (error) {
      console.error("Error adding assignment:", error);
      setError("Error creating assignment!");
    }
  };

  // Handle updating an assignment
  const handleUpdateAssignment = async () => {
    const { title, description, dueDate } = newAssignment;
    const userId = 1; // Assuming you're updating for the same user

    try {
      const response = await api.patch(
        `/api/update-assignment/${assignmentId}`,
        {
          title,
          description,
          dueDate,
          userId,
        }
      );

      const updatedAssignments = assignments.map((assignment) =>
        assignment.id === response.data.id ? response.data : assignment
      );
      setAssignments(updatedAssignments);
      setNewAssignment({ title: "", description: "", dueDate: "" });
      setAssignmentId(""); // Reset assignmentId
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  // Handle deleting an assignment
  const handleDeleteAssignment = async (id) => {
    try {
      await api.delete(`/api/delete-assignment/${id}`);
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  return (
    <div className="lg:w-[70%] mx-auto container justify-center items-center">
      {/* Navigation */}
      <div className="flex flex-row gap-3 mb-4">
        <button
          onClick={() => {
            setShowForm(true);
            setSelectedAssignment(null); // Clear selected assignment when switching views
          }}
          className={`p-2 rounded ${
            showForm
              ? "bg-cyan-950 dark:bg-yellow-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Add Assignment
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setSubmissions([]); // Clear submissions when switching views
          }}
          className={`p-2 rounded ${
            !showForm
              ? "bg-cyan-950 dark:bg-yellow-500 text-white"
              : "bg-gray-200"
          }`}
        >
          View Assignments
        </button>
        <button
          onClick={() => {
            fetchSubmissions(); // Fetch submissions when this button is clicked
            setShowForm(false); // Ensure we are in the submissions view
          }}
          className={`p-2 rounded ${
            !showForm
              ? "bg-cyan-950 dark:bg-yellow-500 text-white"
              : "bg-gray-200"
          }`}
        >
          View Submitted Assignments
        </button>
      </div>

      {showForm ? (
        // Form to add or update an assignment
        <div className="p-4 border rounded bg-white dark:bg-transparent dark:shadow-white shadow-md">
          {success ? (
            <p className="text-green-600 font-semibold text-center text-md">
              {success}
            </p>
          ) : (
            <p className="text-red-600 font-semibold text-center text-md">
              {error}
            </p>
          )}
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">
            {selectedAssignment ? "Update Assignment" : "Add New Assignment"}
          </h2>
          <input
            type="text"
            name="title"
            placeholder="Assignment Title"
            value={newAssignment.title}
            onChange={handleChange}
            className="border rounded p-2 mb-2 w-full"
          />
          <textarea
            name="description"
            placeholder="Assignment Description"
            value={newAssignment.description}
            onChange={handleChange}
            className="border rounded p-2 mb-2 w-full"
          />
          <input
            type="date"
            name="dueDate"
            value={newAssignment.dueDate}
            onChange={handleChange}
            className="border rounded p-2 mb-2 w-full"
          />
          {selectedAssignment ? (
            <button
              onClick={handleUpdateAssignment}
              className="bg-cyan-950 dark:bg-yellow-500 text-white p-2 rounded w-full"
            >
              Update Assignment
            </button>
          ) : (
            <button
              onClick={handleAddAssignment}
              className="bg-cyan-950 dark:bg-yellow-500 text-white p-2 rounded w-full"
            >
              Add Assignment
            </button>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">
            View Assignments
          </h2>
          {/* Fetch by ID Section */}
          <div className="mb-4">
            {selectedAssignment && (
              <div className="mt-4 p-4 border rounded dark:text-gray-400">
                <p>
                  <strong>Title:</strong> {selectedAssignment.title}
                </p>
                <p>
                  <strong>Description:</strong> {selectedAssignment.description}
                </p>
                <p>
                  <strong>Due Date:</strong>{" "}
                  {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* List of assignments */}
          <ul className="mt-4 bg-white dark:bg-transparent dark:shadow-white shadow-md border rounded p-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <li
                  key={assignment.id}
                  onClick={() => handleFetchAssignmentById(assignment.id)}
                  className="flex justify-between items-center p-2 border-b dark:text-gray-400 hover:cursor-pointer"
                >
                  <div className="text-gray-800 dark:text-gray-300">
                    <p>
                      <strong>Title:</strong> {assignment.title}
                    </p>
                    <p>
                      <strong>Description:</strong> {assignment.description}
                    </p>
                    <p>
                      <strong>Due Date:</strong>{" "}
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))
            ) : (
              <p>No assignments available.</p>
            )}
          </ul>

          {/* Submitted Assignments Section */}
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-200 py-5">
            Submitted Assignments
          </h2>
          <div className="mt-4 bg-white dark:bg-transparent shadow-md border rounded-lg p-4">
            {submissions.length > 0 ? (
              // Group submissions by assignment title
              Object.entries(
                submissions.reduce((acc, submission) => {
                  const title = submission.assignment.title;
                  if (!acc[title]) {
                    acc[title] = [];
                  }
                  acc[title].push(submission);
                  return acc;
                }, {})
              ).map(([title, subs]) => (
                <div key={title} className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-2">
                    {title}
                  </h3>
                  <ul className="space-y-4">
                    {subs.map((submission) => (
                      <li
                        key={submission.id}
                        className="flex flex-col p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                              submission.grading &&
                              submission.grading.length > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {submission.grading && submission.grading.length > 0
                              ? `Grade: ${submission.grading[0].grade}%`
                              : "Not Graded"}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Student:</strong> {submission.user.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Content:</strong> {submission.content}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 py-2">
                          <strong>Submitted On:</strong>{" "}
                          {new Date(
                            submission.submissionDate
                          ).toLocaleDateString()}
                        </p>

                        <div className="flex flex-col gap-4">
                          <strong className="dark:text-gray-300">
                            Feedback:
                          </strong>
                          <span className="text-green-500 italic">
                            {submission.grading && submission.grading.length > 0
                              ? submission.grading[0].feedback ||
                                "No feedback provided."
                              : "No feedback provided."}
                          </span>
                          <span className="font-semibold text-lg dark:text-gray-300">
                            File Submission
                          </span>
                          <a
                            href={`${BASE_URL}/uploads/assignments/${submission.file}`}
                            className="text-yellow-500 hover:cursor-pointer hover:underline"
                          >
                            {submission.file}
                          </a>
                        </div>

                        <button
                          onClick={() => handleOpenModal(submission)}
                          className={`bg-cyan-950 dark:bg-yellow-500 text-white rounded w-[90px] px-4 py-2 mt-2 ${
                            submission.grading && submission.grading.length > 0
                              ? "opacity-50 cursor-not-allowed" // Change style if already graded
                              : "hover:shadow-md hover:shadow-white"
                          }`}
                          disabled={
                            submission.grading && submission.grading.length > 0
                          } // Disable button if already graded
                        >
                          Grade
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No submitted assignments available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Grading Modal */}
      <GradingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        submission={currentSubmission}
        onGrade={handleGradeSubmission}
      />
    </div>
  );
};

export default ManageAssignments;
