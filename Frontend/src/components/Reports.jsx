import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserContext } from "../contexts/userContext";
import { useContext, useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/ChainCertifyNFT.sol/ChainCertifyNFT.json";
import WalletContext from "../contexts/walletContext";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const Reports = () => {
  const { user } = useContext(UserContext);
  const { isLoggedIn } = useAuth();
  const { api } = useAuth();
  const [mintAllowed, setMintAllowed] = useState(null);
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const { isWalletConnected, connectWallet, account, balance } =
    useContext(WalletContext);
  const navigate = useNavigate();

  const handleClosePopup = () => {
    setShowCongratsPopup(false);
  };

  const handleOpenPopup = () => {
    console.log("Opening popup...");
    setShowCongratsPopup(true);
  };

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

  const handleClaimCertificate = async () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet to mint the certificate.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Generate a smaller, database-friendly ID
      const dbTokenId = Math.floor(Date.now() / 1000); // Unix timestamp as integer

      // Generate blockchain tokenId (BigInt)
      const randomPart = Math.floor(Math.random() * 1000000);
      const tokenIdString = `${user.id}-${randomPart}-${Date.now()}`;
      const blockchainTokenId = BigInt(tokenIdString.replace(/-/g, ""));

      const _names = user.name;
      const _institution = "ABYA UNIVERSITY";
      const _courseName = "Introduction to Blockchain";
      const _issueDate = new Date().toISOString().split("T")[0];

      console.log("Minting Parameters:", {
        account,
        blockchainTokenId: blockchainTokenId.toString(),
        dbTokenId,
        _names,
        _institution,
        _courseName,
        _issueDate,
      });

      // Add gas estimation
      const gasEstimate = await contract.mintNFT.estimateGas(
        account,
        blockchainTokenId,
        _names,
        _institution,
        _courseName,
        _issueDate
      );

      const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2));

      const tx = await contract.mintNFT(
        account,
        blockchainTokenId,
        _names,
        _institution,
        _courseName,
        _issueDate,
        {
          gasLimit: gasLimit,
        }
      );

      console.log("Transaction Hash:", tx.hash);

      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error("Transaction failed - no receipt received");
      }

      console.log("Transaction Receipt:", receipt);

      if (receipt.status === 1) {
        try {
          // Send the database-friendly integer ID to the API
          const apiResponse = await api.post("/api/certificates", {
            to: account,
            tokenId: dbTokenId, // Using the smaller, integer ID for database
            blockchainTokenId: blockchainTokenId.toString(), // Optional: if you want to store the blockchain token ID as string
            institution: _institution,
            courseName: _courseName,
            issueDate: _issueDate,
            userId: user.id,
          });

          console.log("API Response:", apiResponse);

          alert("Certificate minted successfully!");

          setTimeout(() => {
            navigate("/certificate", {
              state: {
                to: account,
                tokenId: dbTokenId, // Using the database ID for navigation
                names: _names,
                institution: _institution,
                courseName: _courseName,
                issueDate: _issueDate,
                userId: user.id,
                blockchainTokenId: blockchainTokenId.toString(), // Optional: if needed in the certificate view
              },
            });
          }, 2000);

          handleClosePopup();
        } catch (apiError) {
          console.error("API Error:", apiError);
          console.error("API Error Details:", {
            message: apiError.message,
            response: apiError.response?.data,
            status: apiError.response?.status,
          });
          alert(
            "Certificate minted successfully, but there was an error saving the details. Please contact support."
          );
        }
      } else {
        throw new Error(
          `Transaction failed - receipt status: ${receipt.status}`
        );
      }
    } catch (error) {
      console.error("Error Details:", {
        message: error.message,
        code: error.code,
        data: error.data,
        transaction: error.transaction,
        receipt: error.receipt,
        stack: error.stack,
      });

      let errorMessage = "An error occurred while minting the certificate.";

      if (error.code === "ACTION_REJECTED") {
        errorMessage = "Transaction was rejected by the user.";
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds to complete the transaction.";
      } else if (error.message.includes("gas")) {
        errorMessage =
          "Transaction failed due to gas estimation. Please try again.";
      } else if (error.message.includes("nonce")) {
        errorMessage =
          "Transaction nonce error. Please reset your wallet's transaction history.";
      } else if (error.message.includes("BigInt")) {
        errorMessage = "Error with transaction values. Please try again.";
      }

      alert(errorMessage);
      throw error;
    }
  };

  function roundOff(number, decimalPlaces = 2) {
    if (isNaN(number)) {
      console.log("Invalid number");
      return 0;
    }

    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
  }

  function getGrade() {
    // Check if the user object and the grading array exist
    if (!user || !user.grading) {
      console.log("Invalid user object");
      return 0;
    }

    // Filter out grades that are 0 or belong to quizzes (have a quizId)
    const filteredGrades = user.grading.filter(
      (item) => item.grade > 0 && !item.quizId
    );

    // Get the grades after filtering
    const gradesAboveZero = filteredGrades.map((item) => item.grade);
    console.log("Filtered Grades: ", gradesAboveZero);

    // Calculate the sum of the filtered grades
    const sumOfGrades = gradesAboveZero.reduce((sum, grade) => sum + grade, 0);

    // Calculate the total possible grades for percentage calculation
    // Assuming a maximum of 75 points per grade (adjust this as per your grading scale)
    const totalPossible = filteredGrades.length * 100;

    // Calculate the percentage
    const percentage = roundOff((sumOfGrades / totalPossible) * 100, 2);

    console.log("Percentage: ", percentage);

    return percentage;
  }

  getGrade();

  console.log(user);

  return (
    <>
      <div className="container mx-auto p-4 transition-all duration-1000 w-full md:w-[70%] md:mx-auto md:ml-[240px] lg:w-[60%] lg:mx-auto">
        <div className="mx-auto right-0 flex items-end justify-end">
          {isLoggedIn ? (
            mintAllowed ? (
              getGrade() >= 80 ? (
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
            )
          ) : null}
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
                onClick={handleClaimCertificate}
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
