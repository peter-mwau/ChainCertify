import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import DeleteConfirm from "./DeleteConfirm";

const ManageQuizzes = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    questions: [],
  });
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([{ text: "", isCorrect: false }]);
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("add"); // State to track active tab
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Fetch quizzes from API on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      const response = await api.get("/api/quizzes");
      const data = response.data;
      setQuizzes(data);
    };
    fetchQuizzes();
  }, [api]);

  // Add a new quiz
  const handleAddQuiz = async () => {
    const quizPayload = {
      title: newQuiz.title,
      description: newQuiz.description,
      questions: newQuiz.questions.map((question) => ({
        text: question.text,
        questionType: question.questionType,
        options: question.options.length > 0 ? question.options : [],
      })),
      userId: user.id,
    };

    try {
      const response = await api.post("/api/create-quiz", quizPayload);
      const createdQuiz = response.data;
      setQuizzes([...quizzes, createdQuiz]);
      setSuccess(`${quizPayload.title} created Successfully!!`);
      resetForm(); // Clear form
    } catch (error) {
      console.error("Error adding quiz:", error);
    }
  };

  const resetForm = () => {
    setNewQuiz({ title: "", description: "", questions: [] });
    setQuestionText("");
    setOptions([{ text: "", isCorrect: false }]);
  };

  const handleAddQuestion = () => {
    if (questionText.trim()) {
      const newQuestion = {
        text: questionText,
        options: options.map((option) => ({
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      };
      setNewQuiz((prevQuiz) => ({
        ...prevQuiz,
        questions: [...prevQuiz.questions, newQuestion],
      }));
      setQuestionText(""); // Clear question input
      setOptions([{ text: "", isCorrect: false }]); // Reset options
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleOptionChange = (index, key, value) => {
    const updatedOptions = options.map((option, i) =>
      i === index ? { ...option, [key]: value } : option
    );
    setOptions(updatedOptions);
  };

  // Delete a quiz
  const handleDeleteQuiz = async (quizId) => {
    setIsModalOpen(true);
    setQuizToDelete(quizId);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/delete-quiz/${quizToDelete}`);
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizToDelete));
      setSuccess(`Quiz ${quizToDelete} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete the quiz. Please try again.");
    } finally {
      setIsModalOpen(false); // Close the modal regardless of success/failure
      setQuizToDelete(null); // Reset the quiz to delete
    }
  };

  //navigate to edit quiz component
  const handleEditQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}`);
  };

  return (
    <div className="w-[80%] transition-all duration-1000 h-auto mx-auto container justify-center items-center">
      <div className="mb-4">
        <button
          className={`p-2 mr-2 ${
            activeTab === "add"
              ? "bg-cyan-950 dark:bg-yellow-500 text-white"
              : "bg-gray-200"
          } rounded-md`}
          onClick={() => setActiveTab("add")}
        >
          Add Quiz
        </button>
        <button
          className={`p-2 ${
            activeTab === "list"
              ? "bg-cyan-950 dark:bg-yellow-500 text-white"
              : "bg-gray-200"
          } rounded-md`}
          onClick={() => setActiveTab("list")}
        >
          View Quizzes
        </button>
      </div>

      {success && <div className="text-green-400 mb-4">{success}</div>}

      {activeTab === "add" && (
        <div className="dark:shadow-white shadow-md rounded-md p-3">
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">
            Add New Quiz
          </h2>
          <input
            type="text"
            placeholder="Quiz Title"
            value={newQuiz.title}
            onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
            className="border rounded p-2 mb-2"
          />
          <textarea
            placeholder="Quiz Description"
            value={newQuiz.description}
            onChange={(e) =>
              setNewQuiz({ ...newQuiz, description: e.target.value })
            }
            className="border rounded p-2 mb-2 w-full"
          />

          <h3 className="text-2xl mt-4 mb-2 dark:text-gray-300">
            Add Question
          </h3>
          <input
            type="text"
            placeholder="Question Text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="border rounded p-2 mb-2"
          />

          <h4 className="text-xl mt-2 mb-1 dark:text-gray-300">Options</h4>
          {options.map((option, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                placeholder="Option Text"
                value={option.text}
                onChange={(e) =>
                  handleOptionChange(index, "text", e.target.value)
                }
                className="border rounded p-2 mr-2"
              />
              <label className="dark:text-gray-200 my-auto space-x-4">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) =>
                    handleOptionChange(index, "isCorrect", e.target.checked)
                  }
                />
                Correct
              </label>
            </div>
          ))}
          <div className="gap-2 flex flex-row">
            <button
              onClick={handleAddOption}
              className="bg-green-500 text-white p-2 rounded mb-4  w-auto"
            >
              Add Option
            </button>

            <button
              onClick={handleAddQuestion}
              className="bg-cyan-950 dark:bg-yellow-500 text-white p-2 rounded mb-4 w-auto"
            >
              Add Question
            </button>
          </div>

          {/* Render Added Questions */}
          <h3 className="text-2xl mt-4 mb-2 dark:text-gray-300">
            Added Questions
          </h3>
          <ul className="list-disc ml-6">
            {newQuiz.questions.map((question, index) => (
              <li key={index} className="mb-2">
                <strong>{question.text}</strong>
                <ul className="ml-4">
                  {question.options.map((option, oIndex) => (
                    <li key={oIndex}>
                      {option.text} {option.isCorrect && <span>(Correct)</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <button
            onClick={handleAddQuiz}
            className="bg-cyan-950 dark:bg-yellow-500 text-white p-2 rounded w-auto mt-[50px]"
          >
            Create Quiz
          </button>
        </div>
      )}

      {activeTab === "list" && (
        <div>
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">
            Existing Quizzes
          </h2>
          <ul className="mt-4">
            {quizzes.map((quiz) => (
              <li
                key={quiz.id}
                className="border p-3 mb-2 dark:text-gray-300 rounded-md shadow-md dark:shadow-white"
              >
                <h3 className="text-xl font-semibold">{quiz.title}</h3>
                <p>{quiz.description}</p>

                <ul className="mt-2">
                  {quiz.questions.map((question, qIndex) => (
                    <li key={qIndex} className="mb-2">
                      <strong>
                        {qIndex + 1}. {question.text}
                      </strong>
                      <ul>
                        {question.options.map((option, oIndex) => (
                          <li key={oIndex} className="font-light italic">
                            {`${String.fromCharCode(97 + oIndex)})`}{" "}
                            {option.text} {/* a), b), c)... */}
                            {option.isCorrect && <span>(Correct)</span>}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-row gap-3">
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)} // Pass the quiz ID here
                    className="bg-red-500 text-white p-1 rounded mt-2"
                  >
                    Delete Quiz
                  </button>
                  <button
                    onClick={() => handleEditQuiz(quiz.id)}
                    className="bg-cyan-950 dark:bg-yellow-500 text-white p-1 rounded mt-2 mr-2"
                  >
                    Edit Quiz
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DeleteConfirm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete quiz ${quizToDelete}?`}
      />
    </div>
  );
};

export default ManageQuizzes;
