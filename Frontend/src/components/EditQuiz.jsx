import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For dynamic routing
import { useAuth } from "../contexts/authContext";

const EditQuiz = () => {
  const { quizId } = useParams(); // Get the quiz ID from the route
  const { api } = useAuth();
  const [quiz, setQuiz] = useState(null); // Store the quiz data
  const [updatedQuiz, setUpdatedQuiz] = useState(null); // Updated quiz for editing
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch quiz data by ID
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/api/quizzes/${quizId}`);
        console.log("Fetched Quiz Data: ", response.data);
        setQuiz(response.data);
        setUpdatedQuiz(response.data); // Initialize updatedQuiz with fetched data
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to fetch quiz. Please try again.");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, api]);

  // Update question
  const handleUpdateQuestion = (questionIndex, updatedQuestion) => {
    const updatedQuestions = [...updatedQuiz.questions];
    updatedQuestions[questionIndex] = updatedQuestion;
    setUpdatedQuiz({ ...updatedQuiz, questions: updatedQuestions });
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    try {
      await api.delete(`/api/quizzes/${quizId}/questions/${questionId}`);
      setUpdatedQuiz({
        ...updatedQuiz,
        questions: updatedQuiz.questions.filter((q) => q.id !== questionId),
      });
      setSuccess(`Question deleted successfully`);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Update the entire quiz
  const handleSaveQuiz = async () => {
    try {
      await api.put(`/api/edit-quiz/${quizId}`, updatedQuiz);
      setSuccess("Quiz updated successfully!");
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  // Update option text or correctness
  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...updatedQuiz.questions];

    if (field === "text") {
      updatedQuestions[questionIndex].options[optionIndex].text = value;
    }

    setUpdatedQuiz({ ...updatedQuiz, questions: updatedQuestions });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!updatedQuiz) return <div>No quiz data available</div>;

  return (
    <>
      <div className="w-full pt-[100px] p-5 transition-all duration-1000 dark:bg-cyan-900">
        <div className="w-[60%] mx-auto p-5 transition-all duration-1000 dark:bg-cyan-900">
          {success && <div className="text-green-400 mb-4">{success}</div>}
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">
            Edit Quiz: {quiz.title}
          </h2>
          <div className="mb-4">
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={() => navigate("/admin")}
            >
              Back to Quizzes
            </button>
          </div>
          {updatedQuiz.questions.map((question, questionIndex) => (
            <div
              key={question.id}
              className="border p-4 mb-4 rounded-md shadow-md dark:shadow-white"
            >
              <h3 className="text-xl mb-2 dark:text-gray-300">
                Question {questionIndex + 1}
              </h3>
              <input
                type="text"
                value={updatedQuiz?.questions[questionIndex].text}
                onChange={(e) =>
                  handleUpdateQuestion(questionIndex, {
                    ...updatedQuiz.questions[questionIndex],
                    text: e.target.value,
                  })
                }
                className="border p-2 mb-2 w-full"
              />
              <h4 className="text-lg mb-1 dark:text-gray-300">Options</h4>
              {updatedQuiz.questions[questionIndex].options.map(
                (option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          "text",
                          e.target.value
                        )
                      }
                      className="border p-2 mr-2 w-full"
                    />
                    <label className="dark:text-gray-200 ">
                      <input
                        type="checkbox"
                        checked={
                          optionIndex ===
                          updatedQuiz.questions[questionIndex].correctOption
                        }
                        onChange={() => {
                          const updatedQuestions = [...updatedQuiz.questions];
                          updatedQuestions[questionIndex].correctOption =
                            optionIndex;
                          setUpdatedQuiz({
                            ...updatedQuiz,
                            questions: updatedQuestions,
                          });
                        }}
                      />
                      Correct
                    </label>
                  </div>
                )
              )}

              <button
                onClick={() => handleDeleteQuestion(question.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete Question
              </button>
            </div>
          ))}

          <button
            onClick={handleSaveQuiz}
            className="bg-cyan-950 dark:bg-yellow-500 text-white p-2 rounded"
          >
            Save Quiz
          </button>
        </div>
      </div>
    </>
  );
};

export default EditQuiz;
