import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";

const ManageCertificates = () => {
  const { api } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [success, setSuccess] = useState("");
  const [mintCertificates, setMintCertificates] = useState(null); // Initially null
  const BASE_URL = "http://127.0.0.1:8080";

  // Fetch the initial minting status from the database
  useEffect(() => {
    const fetchMintStatus = async () => {
      try {
        const response = await api.get("/api/mint-status");
        setMintCertificates(response.data.allowed);
      } catch (error) {
        console.error("Error fetching minting status:", error);
      }
    };
    fetchMintStatus();
  }, [api]);

  // Handle minting action triggered by the admin
  const toggleMintCertificates = async () => {
    try {
      const response = await api.post("/api/toggle-mint-status");
      setMintCertificates(response.data.status); // Update to new status from response
      setSuccess("Certificates minting status updated successfully!");
    } catch (error) {
      console.error("Error toggling minting status:", error);
    }
  };

  if (mintCertificates === null) {
    // Render loading state if data is not yet fetched
    return <p>Loading minting status...</p>;
  }

  return (
    <div className="overflow-x-auto mx-auto container justify-center items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-200">
        Manage Certificates
      </h1>

      {/* Admin button to toggle minting status */}
      <button
        onClick={toggleMintCertificates}
        className="bg-cyan-950 text-gray-100 font-semibold rounded-md py-2 px-4 mb-4 hover:bg-yellow-500 transition duration-300"
      >
        {mintCertificates
          ? "Disallow Minting of Certificates"
          : "Allow Minting of Certificates"}
      </button>

      {success && (
        <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mt-2">
          {success}
        </p>
      )}

      <div className="pt-5">
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-300">
          Minting Status:
          {mintCertificates ? (
            <span className="text-green-500 font-bold px-2">Enabled</span>
          ) : (
            <span className="text-red-500 font-bold px-2">Disabled</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ManageCertificates;
