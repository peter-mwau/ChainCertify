import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";

const ManageProjects = () => {
  const { api } = useAuth();
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState("");

  const BASE_URL = "http://127.0.0.1:8080";

  // Fetch submitted projects
  const fetchSubmittedProjects = async () => {
    try {
      const response = await api.get("/api/projects");
      setSubmittedProjects(response.data); // Update state with submitted projects
    } catch (error) {
      console.error("Error fetching submitted projects:", error.message);
    }
  };

  console.log("Submitted Projects: ", submittedProjects);

  useEffect(() => {
    fetchSubmittedProjects(); // Fetch the projects when the component mounts
  }, []);

  const openModal = (project) => {
    setSelectedProject(project);
    setGrade(""); // Clear previous grade
    setFeedback(""); // Clear previous feedback
    setShowModal(true); // Show the modal
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const handleGradeSubmit = async () => {
    if (!selectedProject) return;

    try {
      const response = await api.post(
        `/api/grade-project/${selectedProject.id}/`,
        {
          grade,
          feedback,
          assignmentId: selectedProject.assignment.id,
        }
      );

      console.log(response.data);

      // Update the project list with the graded project
      setSubmittedProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === selectedProject.id
            ? { ...project, grade, feedback }
            : project
        )
      );

      setSuccess("Successfully graded!!");
      setGrade("");
      setFeedback("");

      //   closeModal(); // Close the modal after submission
    } catch (error) {
      console.error("Error grading project:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">
        Submitted Projects
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        {submittedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-transparent shadow-cyan-950 dark:shadow-white shadow-md rounded-lg p-4"
          >
            <img
              src={`${BASE_URL}/uploads/projects/${project.projectImages}`}
              alt={project.title}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="mt-4">
              <h3 className="text-xl font-semibold  dark:text-white">
                {project.title}
              </h3>
              <p className="text-gray-600  dark:text-gray-300">
                {project.description}
              </p>
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className=" underline text-yellow-500"
              >
                View GitHub Repository
              </a>
              <p className="text-gray-500 mt-2 dark:text-gray-400">
                Assignment: {project.assignment?.title || "None"}
              </p>
              <p className="text-gray-500 mt-2 dark:text-gray-400">
                Student: {project.user?.name || "None"}
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full w-[110px] ${
                    project.grading && project.grading.length > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {project.grading && project.grading.length > 0
                    ? `Grade: ${project.grading[0].grade}%`
                    : "Not Graded"}
                </span>
                <span className="text-green-500 italic">
                  {project.grading && project.grading.length > 0 ? (
                    project.grading[0].feedback || (
                      <span className="text-red-600">
                        No feedback provided.
                      </span>
                    )
                  ) : (
                    <span className="text-red-600">No feedback provided.</span>
                  )}
                </span>
              </div>

              <button
                onClick={() => openModal(project)}
                className={`mt-4 bg-cyan-950 dark:bg-yellow-500 text-white py-2 px-4 rounded 
                ${
                  project.grading && project.grading.length > 0
                    ? "opacity-50 cursor-not-allowed" // Change style if already graded
                    : "hover:shadow-md"
                }`}
              >
                Grade Project
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for grading */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg md:w-2/3 lg:w-[50%] w-[90%] dark:bg-cyan-900 dark:text-white dark:shadow-white">
            <div className="flex flex-row justify-between">
              <h3 className="text-lg font-bold mb-4">
                Grade Project: {selectedProject?.title}
              </h3>
              <p className="italic text-gray-400">
                {selectedProject.user.name}
              </p>
            </div>
            {success && (
              <div className="text-center text-green-600">{success}</div>
            )}
            <p className="py-2">{selectedProject.assignment.title}</p>
            <p>{selectedProject.description}</p>
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grade:
              </label>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:text-gray-800 rounded-md shadow-sm focus:outline-none  sm:text-sm "
                required
                min="0"
                max="100"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Feedback:
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter feedback"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleGradeSubmit}
                className="bg-cyan-950 dark:bg-yellow-500 text-white py-2 px-4 rounded mr-2"
              >
                Submit Grade
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProjects;
