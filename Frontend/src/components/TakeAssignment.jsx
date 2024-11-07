import { useContext, useState } from "react";
import { useAuth } from "../contexts/authContext";
import PropTypes from "prop-types";
import { UserContext } from "../contexts/userContext";

const TakeAssignment = ({ assignment }) => {
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const { api, accessToken } = useAuth();
  const { user } = useContext(UserContext);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("submissionText", submissionText);
    if (selectedFile) {
      formData.append("assignmentFile", selectedFile);
    }

    try {
      const response = await api.post(
        `/api/submit-assignment/${assignment.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response.data);
      setSubmissionStatus("Assignment submitted successfully!");
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setSubmissionStatus("Error submitting assignment. Please try again.");
    }
  };

  const isDeadlinePassed = new Date(assignment.deadline) < new Date();

  if (!assignment) {
    return <p>Loading assignment details...</p>;
  }

  return (
    <div className="container mx-auto p-4 w-full md:w-[70%] md:mx-auto md:ml-[240px] lg:w-[60%] lg:mx-auto transition-all duration-1000">
      <h2 className="text-2xl font-bold mb-4">{assignment.title}</h2>
      <p className="text-lg mb-4">{assignment.description}</p>
      <p
        className={`text-gray-600 dark:text-gray-300 font-semibold ${
          isDeadlinePassed
            ? "text-red-500 dark:text-red-500"
            : "text-green-500 dark:text-green-600"
        }`}
      >
        Due Date: {new Date(assignment.deadline).toLocaleDateString()}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="submissionText" className="block text-lg font-medium">
            Write Your Submission:
          </label>
          <textarea
            id="submissionText"
            className="w-full border rounded p-2 mt-2 dark:text-gray-700"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Type your answer here..."
            rows="6"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fileUpload" className="block text-lg font-medium">
            Upload PDF (optional):
          </label>
          <input
            type="file"
            id="fileUpload"
            name="assignmentFile"
            className="mt-2"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>
        {user?.role == "STUDENT" && user?.loggedIn && (
          <button
            type="submit"
            className="bg-cyan-950 dark:bg-yellow-500 text-white p-2 rounded"
          >
            Submit Assignment
          </button>
        )}
      </form>

      {submissionStatus && (
        <p className="mt-4 text-green-600">{submissionStatus}</p>
      )}
    </div>
  );
};

TakeAssignment.propTypes = {
  assignment: PropTypes.object.isRequired,
};

export default TakeAssignment;
