import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserContext } from "../contexts/userContext";
import { useContext, useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";

const Reports = () => {
  const { user } = useContext(UserContext);
  const { isLoggedIn } = useAuth();
  const { api } = useAuth();
  const [mintAllowed, setMintAllowed] = useState(null);
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);

  const handleClosePopup = () => {
    setShowCongratsPopup(false);
  };

  const handleOpenPopup = () => {
    console.log("Opening popup...");
    setShowCongratsPopup(true);
  };

  console.log("Popup: ", showCongratsPopup);

  const BASE_URL = "http://127.0.0.1:8080";

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(`${user.name}'s Report`, 14, 20);

    // User details
    autoTable(doc, {
      startY: 30,
      head: [["Detail", "Information"]],
      body: [
        ["Name", user.name],
        ["Email", user.email],
        ["Role", user.role],
      ],
    });

    // Assignments
    if (user.submissions.length > 0) {
      autoTable(doc, {
        startY: doc.autoTable.previous.finalY + 10,
        head: [["Assignment ID", "Content", "File", "Submission Date"]],
        body: user.submissions.map((submission) => [
          submission.assignmentId,
          submission.content.substring(0, 50) + "...",
          submission.file ? `Download (${submission.file})` : "No file",
          new Date(submission.submissionDate).toLocaleDateString(),
        ]),
      });
    }

    // Quizzes
    if (user.quizAttempts.length > 0) {
      autoTable(doc, {
        startY: doc.autoTable.previous.finalY + 10,
        head: [["Quiz ID", "Score", "Date Taken"]],
        body: user.quizAttempts.map((attempt) => [
          attempt.quizId,
          `${attempt.score}%`,
          new Date(attempt.createdAt).toLocaleDateString(),
        ]),
      });
    }

    // Projects
    if (user.projects.length > 0) {
      autoTable(doc, {
        startY: doc.autoTable.previous.finalY + 10,
        head: [
          ["Title", "Description", "GitHub Link", "Image", "Assignment ID"],
        ],
        body: user.projects.map((project) => [
          project.title,
          project.description.substring(0, 50) + "...",
          project.githubLink ? `Link (${project.githubLink})` : "No Link",
          project.projectImages
            ? `Image (${project.projectImages})`
            : "No Image",
          project.assignmentId || "N/A",
        ]),
      });
    }

    doc.save(`${user.name}_Report.pdf`);
  };

  // Fetch minting status from the backend
  useEffect(() => {
    const fetchMintStatus = async () => {
      try {
        const response = await api.get("/api/mint-status");
        setMintAllowed(response.data.allowed);
        console.log("Allowed:", response.data.allowed);
        console.log("All: ", mintAllowed);
      } catch (error) {
        console.error("Error fetching minting status:", error);
      }
    };

    fetchMintStatus();
  }, []);

  return (
    <>
      <div className="container mx-auto p-4 transition-all duration-1000 w-full md:w-[70%] md:mx-auto md:ml-[240px] lg:w-[60%] lg:mx-auto">
        <div className="mx-auto right-0 flex items-end justify-end">
          {mintAllowed ? (
            user.grading[0].grade >= 80 ? (
              <button
                onClick={handleOpenPopup}
                className="bg-cyan-950 text-gray-50 font-semibold p-2 rounded-md my-2 hover:cursor-pointer hover:bg-yellow-500"
              >
                Claim Certificate
              </button>
            ) : (
              <button
                className="bg-gray-500 text-gray-50 font-semibold p-2 rounded-md my-2"
                disabled
              >
                Claim Certificate
              </button>
            )
          ) : (
            <p className="text-red-400 py-2">
              Minting is currently disabled. Please wait for admin approval.
            </p>
          )}
        </div>
        {isLoggedIn && user?.role === "STUDENT" ? (
          <div className="bg-white dark:bg-cyan-900 shadow-md rounded-lg p-6 w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Student Report
            </h2>

            {/* User Information */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Student Details</h3>
              <ul>
                <li>
                  <strong>Name:</strong> {user.name}
                </li>
                <li>
                  <strong>Email:</strong> {user.email}
                </li>
                <li>
                  <strong>Role:</strong> {user.role}
                </li>
              </ul>
            </div>

            {/* Assignments */}
            {user.submissions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Assignments</h3>
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Assignment ID</th>
                      <th className="px-4 py-2">Content</th>
                      <th className="px-4 py-2">File</th>
                      <th className="px-4 py-2">Submission Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="border px-4 py-2">
                          {submission.assignmentId}
                        </td>
                        <td className="border px-4 py-2">
                          {submission.content.substring(0, 50)}...
                        </td>
                        <td className="border px-4 py-2">
                          {submission.file ? (
                            <a
                              href={`/path/to/files/${submission.file}`}
                              download
                              className="text-yellow-500 underline"
                            >
                              Download
                            </a>
                          ) : (
                            "No file"
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {new Date(
                            submission.submissionDate
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quizzes */}
            {user.quizAttempts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Quizzes</h3>
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Quiz ID</th>
                      <th className="px-4 py-2">Score</th>
                      <th className="px-4 py-2">Date Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.quizAttempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td className="border px-4 py-2">{attempt.quizId}</td>
                        <td className="border px-4 py-2">{attempt.score}%</td>
                        <td className="border px-4 py-2">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Projects */}
            {user.projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Projects</h3>
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">GitHub Link</th>
                      <th className="px-4 py-2 md:hidden lg:block hidden">
                        Image
                      </th>
                      <th className="px-4 py-2">Assignment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.projects.map((project) => (
                      <tr key={project.id}>
                        <td className="border px-4 py-2">{project.title}</td>
                        <td className="border px-4 py-2">
                          {project.description.substring(0, 50)}...
                        </td>
                        <td className="border px-4 py-2">
                          {project.githubLink ? (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-yellow-500 underline"
                            >
                              GitHub
                            </a>
                          ) : (
                            "No Link"
                          )}
                        </td>
                        <td className="border px-1 py-1 md:hidden lg:block hidden">
                          {project.projectImages ? (
                            <img
                              src={`${BASE_URL}/uploads/projects/${project.projectImages}`}
                              className="w-[150px] h-10 rounded-md mx-auto"
                            />
                          ) : (
                            "No Image"
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {project.assignmentId || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Download PDF Button */}
            <div className="text-center mt-4">
              <button
                onClick={generatePDF}
                className="bg-cyan-950 dark:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
              >
                Download Report
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-yellow-500">
            You need to be logged in as a student to view this report.
          </p>
        )}
      </div>
      {showCongratsPopup && (
        <div
          id="popup"
          className="absolute z-50 inset-0 items-center justify-center bg-black bg-opacity-40 overflow-auto"
        >
          <div
            className="relative bg-cyan-950 text-white lg:w-[30%] w-[380px] h-[400px] lg:h-[40%] mt-[200px] rounded-lg p-4 mx-auto my-auto lg:flex lg:items-center lg:justify-center flex-col"
            style={{
              background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/congratulations.jpg')`,
            }}
          >
            <h2 className="text-2xl font-bold mb-4 flex mx-auto justify-center items-center text-white">
              Congratulations!
            </h2>
            <p>
              Click the "Generate Certificate" button to access your
              Certificate.
            </p>
            <div className="flex mx-auto space-x-2 mt-[120px] items-center justify-center">
              <button
                // onClick={handleClaimCertificate}
                id="generateCertificate"
                class="bg-yellow-500 text-white rounded-lg px-4 py-2 mt-4 hover:bg-yellow-400"
              >
                Claim Certificate
              </button>
              <button
                onClick={handleClosePopup}
                id="closePopup"
                class="bg-yellow-500 text-white rounded-lg px-4 py-2 mt-4 hover:bg-yellow-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reports;
