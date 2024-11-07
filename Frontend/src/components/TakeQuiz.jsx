import { useContext, useState } from "react";
import { QuizContext } from "../contexts/quizContext";
import { useAuth } from "../contexts/authContext";
import PropTypes from "prop-types";

const TakeQuiz = ({ quizz }) => {
  const { quiz } = useContext(QuizContext);
  const { api, user } = useAuth();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const quizId = quizz[0]?.id;

  // Filter the current quiz using the quizId
  const currentQuiz = quiz.find((quiz) => quiz.id === quizId);

  console.log("Current Quiz: ", currentQuiz);

  // Check if the current quiz exists
  if (!currentQuiz) {
    return <p className="text-center">Quiz not found</p>;
  }

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleOpenEndedInput = (questionIndex, value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let totalScore = 0;
      const gradingData = [];
      const totalQuestions = currentQuiz.questions.length; // Total number of questions
      const maxScorePerQuestion = 100 / totalQuestions; // Each question's max score is evenly distributed

      // Loop through each question
      for (let i = 0; i < totalQuestions; i++) {
        const question = currentQuiz.questions[i];
        const userAnswer = selectedAnswers[i];

        if (question.options && question.options.length > 0) {
          // Closed-ended question (multiple-choice)
          const correctOption = question.correctOption;
          if (userAnswer === correctOption) {
            // If the user gets the answer right, award full score for this question
            totalScore += maxScorePerQuestion;
            gradingData.push({
              questionId: question.id,
              score: maxScorePerQuestion,
              correct: true,
            });
          } else {
            // Wrong answer, no score awarded
            gradingData.push({
              questionId: question.id,
              score: 0,
              correct: false,
            });
          }
        } else {
          // Open-ended question (evaluate using AI API)
          const aiResponse = await api.post("/api/grade-open-ended", {
            question: question.text,
            answer: userAnswer,
          });

          // AI response grading logic
          let score;
          if (aiResponse.data === "true") {
            score = maxScorePerQuestion; // Full score for correct open-ended answer
          } else if (aiResponse.data === "false") {
            score = 0; // No score for incorrect answer
          } else {
            score = maxScorePerQuestion / 2; // Partial score for "maybe" answers
          }

          totalScore += score; // Add the open-ended question score
          gradingData.push({ questionId: question.id, score });
        }
      }

      // Submit the quiz attempt with the total score and grading details
      await api.post("/api/submit-quiz", {
        quizId: currentQuiz.id,
        userId: user.id, // Replace with actual user ID
        score: totalScore, // Total calculated score
        grading: gradingData, // Grading data for each question
      });

      console.log("Quiz submitted successfully with total score:", totalScore);
      setSuccess(`Quiz submitted successfully with total score: ${totalScore}`);
    } catch (error) {
      // Handle errors
      if (error.response && error.response.data && error.response.data.error) {
        // If the backend sends an error message, display it
        setError(error.response.data.error);
      } else {
        // Handle other unexpected errors
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Error submitting quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-300 dark:bg-cyan-700 shadow-md dark:shadow-white p-5 text-gray-900 w-full md:w-[70%] md:mx-auto md:ml-[240px] lg:w-[60%] lg:mx-auto dark:text-white transition-all duration-1000">
      {success ? (
        <div className="bg-green-600 dark:bg-green-600 p-4 rounded mb-4">
          {success}
        </div>
      ) : (
        error && (
          <div className="bg-red-600 dark:bg-red-600 p-4 rounded mb-4">
            {error}
          </div>
        )
      )}
      <h2 className="text-2xl font-bold text-start mb-4">
        {currentQuiz.title}
      </h2>
      <p className="text-start mb-4">{currentQuiz.description}</p>

      <h3 className="text-xl font-semibold mb-4">Questions:</h3>
      <div className="space-y-4">
        {currentQuiz.questions.map((question, index) => (
          <div
            key={index}
            className="border p-4 rounded bg-white dark:bg-transparent shadow-sm dark:shadow-white"
          >
            <h4 className="text-lg font-semibold">{`Q${index + 1}: ${
              question.text
            }`}</h4>
            <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">
              Select the correct choice:
            </p>
            <ul className="mt-2 space-y-2">
              {question.options && question.options.length > 0 ? (
                question.options.map((option, i) => (
                  <li
                    key={i}
                    className="flex items-center hover:shadow-md hover:shadow-gray-100"
                  >
                    <button
                      onClick={() => handleOptionSelect(index, i)}
                      className={`border rounded p-2 text-start w-full ${
                        selectedAnswers[index] === i
                          ? "bg-yellow-500 text-white font-semibold"
                          : "dark:bg-gray-200 bg-gray-200"
                      } text-gray-800 hover:bg-yellow-500`}
                    >
                      {typeof option === "string" ? option : option.text}
                    </button>
                  </li>
                ))
              ) : (
                <input
                  type="text"
                  placeholder="Type your answer..."
                  className="border p-2 w-full mt-2 dark:text-gray-800 bg-gray-200 dark:bg-white rounded-md"
                  onChange={(e) => handleOpenEndedInput(index, e.target.value)}
                />
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white dark:bg-transparent shadow-md dark:shadow-white rounded">
        <h4 className="text-lg font-semibold mb-2">Your Answers:</h4>
        <ul>
          {currentQuiz.questions.map((question, index) => (
            <li
              key={index}
              className="flex justify-between mb-2 flex-row border-b-2 p-2"
            >
              <span className="items-start w-[50%]">{`Q${index + 1}: ${
                question.text
              }`}</span>
              <span className="text-gray-500 dark:text-gray-100 font-light italic items-start w-[50%] flex-wrap">
                {selectedAnswers[index] !== undefined
                  ? typeof selectedAnswers[index] === "string"
                    ? selectedAnswers[index]
                    : question.options[selectedAnswers[index]]?.text ||
                      "Invalid selection"
                  : "Not answered"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-cyan-950 dark:bg-yellow-500 text-white py-2 px-4 rounded transition-all duration-200"
      >
        {loading ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
};

TakeQuiz.propTypes = {
  quizz: PropTypes.string.isRequired,
};

export default TakeQuiz;
