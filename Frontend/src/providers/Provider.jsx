import { useState, useEffect, useCallback, useMemo } from "react";
import { DarkModeProvider } from "../contexts/themeContext";
import { UserContext } from "../contexts/userContext";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { QuizContext } from "../contexts/quizContext";
import { AssignmentContext } from "../contexts/assignmentContext";
import WalletContext from "../contexts/walletContext";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import CertificateContext from "../contexts/certificateContext";
import ABI from "../artifacts/contracts/ChainCertifyNFT.sol/ChainCertifyNFT.json";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

export default function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshAccessToken, accessToken, api } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [certificate, setCertificate] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request accounts
        const providerInstance = new ethers.BrowserProvider(window.ethereum);
        await providerInstance.send("eth_requestAccounts", []);
        const signer = await providerInstance.getSigner();
        const account = await signer.getAddress();

        // Get balance for the specific account
        const balance = await providerInstance.getBalance(account);
        const etherBalance = ethers.formatEther(balance);

        // Update state
        setBalance(etherBalance);
        setAccount(account);
        setIsWalletConnected(true);
        setProvider(providerInstance);
        setSigner(signer);

        return { account, etherBalance, provider: providerInstance };
      } catch (error) {
        console.error("Failed to connect to MetaMask:", error);
        setIsWalletConnected(false);
        setAccount(null);
        setBalance("");
        setProvider(null);
        throw error; // Re-throw the error for handling by the caller
      }
    } else {
      const error = new Error("Please install MetaMask!");
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    console.log(
      "Account: ",
      account,
      "Balance: ",
      balance,
      "Connection Status: ",
      isWalletConnected
    );
  }, [account, balance, isWalletConnected]);

  const disconnectWallet = () => {
    setAccount(null); // Resets the connected account state
    setIsWalletConnected(false);
  };

  const walletContextValue = useMemo(
    () => ({
      account,
      balance,
      isWalletConnected,
      provider,
      signer,
      connectWallet,
      disconnectWallet,
    }),
    [account, isWalletConnected, balance]
  );

  // Function to get user details
  const getUser = useCallback(async () => {
    if (!accessToken) {
      console.log("Access token is missing");
      return;
    }

    try {
      const response = await api.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          getUser();
        } else {
          navigate("/login");
        }
      }
    }
  }, [accessToken, api, refreshAccessToken, navigate]);

  // Function to fetch all quizzes
  const getQuizes = useCallback(async () => {
    try {
      const response = await api.get("/api/quizzes");
      setQuiz(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, [api]);

  // Fetch all assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const response = await api.get("/api/assignments");
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }, [api]);

  // Function to refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([getQuizes(), getUser(), fetchAssignments()]);
  }, [getQuizes, getUser, fetchAssignments]);

  // Initial data load
  useEffect(() => {
    refreshAllData().then(() => setLoading(false));
  }, [refreshAllData]);

  // Set up polling interval for real-time updates
  useEffect(() => {
    // Poll every 30 seconds for updates
    const pollInterval = setInterval(() => {
      console.log("Polling started");
      refreshAllData();
      console.log("Polling ended");
    }, 30000);

    // Clean up interval on unmount
    return () => clearInterval(pollInterval);
  }, [refreshAllData]);

  // Set up visibility change listener to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAllData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshAllData]);

  // Set up focus listener to refresh data when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      refreshAllData();
    };

    window.addEventListener("focus", handleFocus);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshAllData]);

  // getcertificatedetails from blockchain
  const getCertifiedDetails = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      let userId;

      const certifiedDetails = await contract.getCertificateDetails(userId);
      console.log("Certificate Details: ", certifiedDetails);
      setCertificate(certifiedDetails);
      return certifiedDetails;
    } catch (err) {
      console.log(err);
    }
  };

  // useEffect(() => {
  //   if (user && user.id) {
  //     getCertifiedDetails();
  //   }

  //   console.log("user: ", user);
  // }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  Providers.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <DarkModeProvider>
      <UserContext.Provider
        value={{ user, setUser, loading, refreshData: refreshAllData }}
      >
        <QuizContext.Provider
          value={{ quiz, setQuiz, refreshQuizzes: getQuizes }}
        >
          <AssignmentContext.Provider
            value={{
              assignments,
              setAssignments,
              refreshAssignments: fetchAssignments,
            }}
          >
            <WalletContext.Provider value={walletContextValue}>
              <CertificateContext.Provider value={getCertifiedDetails}>
                {children}
              </CertificateContext.Provider>
            </WalletContext.Provider>
          </AssignmentContext.Provider>
        </QuizContext.Provider>
      </UserContext.Provider>
    </DarkModeProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node,
};
