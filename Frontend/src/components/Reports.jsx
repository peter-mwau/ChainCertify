import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserContext } from "../contexts/userContext";
import { useContext } from "react";
import { useAuth } from "../contexts/authContext";

const Reports = () => {
  const { user } = useContext(UserContext);
  const { isLoggedIn } = useAuth(); // Corrected variable name

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

  return (
    <div className="container mx-auto p-4 transition-all duration-1000 w-full md:w-[70%] md:mx-auto md:ml-[240px] lg:w-[60%] lg:mx-auto">
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
  );
};

export default Reports;
