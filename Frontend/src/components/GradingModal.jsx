import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/authContext";

const GradingModal = ({ isOpen, onClose, submission }) => {
  const [grade, setGrade] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const { api } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for submission
    const gradeData = {
      grade: Number(grade), // Ensure grade is a number
      feedback,
      userId: submission.user.id, // Assuming you have user ID in submission
      assignmentId: submission.assignment.id, // Assuming you have assignment ID in submission
    };

    // Make a PUT request to the grading endpoint using Axios
    try {
      const response = await api.put(
        `/api/grade-submission/${submission.id}`,
        gradeData
      );

      console.log("Grading result:", response.data);
      // Optionally, handle any state updates here, such as closing modal or notifying user
    } catch (error) {
      console.error("Failed to submit grade:", error);
      // Handle error (e.g., display a notification or message)
    }

    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-blue-800 dark:bg-opacity-80 rounded-lg p-6 w-11/12 md:w-1/3">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-200">
          Grade Submission
        </h2>
        <h2 className="text-lg font-bold mb-4 dark:text-gray-200">
          {submission.user.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          <strong>Assignment:</strong> {submission.assignment.title}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          <strong>Submitted On:</strong>{" "}
          {new Date(submission.submissionDate).toLocaleDateString()}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          <strong>Content:</strong> {submission.content}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block mb-1 dark:text-gray-300 font-semibold text-md"
              htmlFor="grade"
            >
              Grade:
            </label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="border rounded-lg p-2 w-full dark:bg-gray-200 dark:text-gray-900"
              placeholder="Enter grade. Its should be a number btwn 0-100"
              required
              min="0" // Minimum value for grade
              max="100" // Maximum value for grade
            />
          </div>
          <div className="mb-4">
            <label
              className="block mb-1 dark:text-gray-300 font-semibold text-md"
              htmlFor="feedback"
            >
              Feedback:
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="border rounded-lg p-2 w-full dark:bg-gray-200 dark:text-gray-900"
              placeholder="Enter feedback"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-cyan-950 dark:bg-yellow-500 text-white px-4 py-2 rounded-lg"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

GradingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  submission: PropTypes.object.isRequired,
};

export default GradingModal;
