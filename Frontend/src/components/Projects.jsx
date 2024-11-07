import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";

const Projects = () => {
  const { api, user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("add");
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [success, setSuccess] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("none");
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    githubLink: "",
  });
  const [projectImages, setProjectImages] = useState([]);

  const BASE_URL = "http://127.0.0.1:8080";

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get("/api/assignments");
        setAssignments(response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, []);

  const fetchSubmittedProjects = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await api.get("/api/projects");
      setSubmittedProjects(response.data);
    } catch (error) {
      console.error("Error fetching submitted projects:", error.message);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchSubmittedProjects();
  }, []);

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setProjectImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", newProject.title);
    formData.append("description", newProject.description);
    formData.append("githubLink", newProject.githubLink);
    formData.append("assignmentId", selectedAssignment);

    for (let i = 0; i < projectImages.length; i++) {
      formData.append("projectImages", projectImages[i]);
    }

    try {
      await api.post("/api/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setNewProject({ title: "", description: "", githubLink: "" });
      setProjectImages([]);
      setSuccess("Project submission successful!");
      fetchSubmittedProjects();
    } catch (error) {
      console.error("Error submitting project:", error.message);
    }
  };

  return (
    <div className="container mx-auto md:w-[75%] transition-all duration-1000">
      {isLoggedIn && user?.role === "STUDENT" ? (
        <>
          <h2 className="text-3xl font-bold mb-4">Projects Dashboard</h2>

          <div className="flex justify-around mb-4">
            <button
              className={`py-2 px-4 rounded ${
                activeTab === "add"
                  ? "bg-cyan-950 dark:bg-yellow-500 text-white"
                  : "bg-gray-200 dark:shadow-white shadow-md dark:text-gray-900"
              }`}
              onClick={() => setActiveTab("add")}
            >
              Add Project
            </button>
            <button
              className={`py-2 px-4 rounded ${
                activeTab === "submissions"
                  ? "bg-cyan-950 dark:bg-yellow-500 text-white"
                  : "bg-gray-200 dark:shadow-white shadow-md dark:text-gray-900"
              }`}
              onClick={() => setActiveTab("submissions")}
            >
              My Submissions
            </button>
          </div>

          {activeTab === "add" && (
            <div className="shadow-md rounded-md p-5 dark:shadow-white shadow-cyan-950">
              <h3 className="text-2xl font-semibold mb-4">
                Submit a New Project
              </h3>
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                encType="multipart/form-data"
              >
                {success && <p className="text-green-500">{success}</p>}
                <div>
                  <label className="block font-medium">Project Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newProject.title}
                    onChange={handleChange}
                    className="w-full p-2 border rounded dark:text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium">
                    Project Description
                  </label>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded dark:text-gray-900"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium">GitHub Link</label>
                  <input
                    type="url"
                    name="githubLink"
                    value={newProject.githubLink}
                    onChange={handleChange}
                    className="w-full p-2 border rounded dark:text-gray-900"
                    required
                  />
                </div>
                <select
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="py-2 w-full p-2 rounded-sm dark:text-gray-900 bg-white"
                >
                  <option value="none">None</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block font-medium">
                    Upload Screenshots/Images
                  </label>
                  <input
                    type="file"
                    name="images"
                    onChange={handleImageChange}
                    multiple
                    className="w-full p-2 border rounded dark:text-gray-200"
                    accept="image/*"
                  />
                </div>
                <button
                  type="submit"
                  className={`bg-cyan-950 dark:bg-yellow-500 text-white py-2 px-4 rounded ${
                    selectedAssignment === "none"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={selectedAssignment === "none"}
                >
                  Submit Project
                </button>
              </form>
            </div>
          )}

          {activeTab === "submissions" && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">
                My Submitted Projects
              </h3>
              {loading ? (
                <p>Loading submitted projects...</p>
              ) : submittedProjects.length > 0 ? (
                <ul className="space-y-4">
                  {submittedProjects
                    .filter((project) => project.user.id === user.id)
                    .map((project) => (
                      <li
                        key={project.id}
                        className="border p-4 rounded shadow-md dark:shadow-white shadow-cyan-950"
                      >
                        <p className="text-end text-sm text-gray-800 dark:text-gray-300 italic">
                          {project.user.name}
                        </p>
                        <h4 className="font-semibold text-lg">
                          Title: {project.title}
                        </h4>
                        <p>Description: {project.description}</p>
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-950 hover:underline"
                        >
                          View on GitHub
                        </a>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {project.projectImages.map((image, index) => (
                            <img
                              key={index}
                              src={`${BASE_URL}/uploads/${image}`}
                              alt={`Project ${index + 1}`}
                              className="rounded-md"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p>No submitted projects found.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-800 dark:text-yellow-500">
          You need to be logged in as a student to view this page.
        </p>
      )}
    </div>
  );
};

export default Projects;
