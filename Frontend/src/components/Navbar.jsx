import { useEffect, useState, useContext } from "react";
import { MdDarkMode } from "react-icons/md";
import { HiMiniBars3 } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { UserContext } from "../contexts/userContext";
import { DarkModeContext } from "../contexts/themeContext";
import { MdOutlineLightMode } from "react-icons/md";
import { useDisconnect, useAccount, useBalance, useConnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  const { isDarkMode, setIsDarkMode } = useContext(DarkModeContext);
  const [openDropdown, setIsOpenDropdown] = useState(false);
  const [openProfile, setIsOpenProfile] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  const { loading } = useContext(UserContext);
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const { connect, connectors } = useConnect();
  const [tokenSymbol, setTokenSymbol] = useState("");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const defaultProfileImage = "/Africa1.jpg";
  const profileImage = user?.profileImage
    ? new URL(user.profileImage, import.meta.env.VITE_API_BASE_URL).toString()
    : defaultProfileImage;
  const username = user?.name || "Guest";
  const userRole = user?.role || "guest";

  return (
    <header className="w-full z-10 lg:mx-auto lg:items-center lg:justify-center transition-all duration-1000 bg-white dark:bg-cyan-900 fixed dark:shadow-red-500 dark:shadow-sm border-b border-yellow-500">
      <div className="container mx-auto flex items-center justify-between h-full p-3 dark:text-white">
        <Link to="/">
          <div className="flex text-2xl uppercase font-extrabold space-x-2">
            <img className="w-10" src="/Africa1.jpg" />
          </div>
        </Link>
        <div className="hidden lg:flex gap-6 md:flex">
          <ul className="flex gap-6">
            <li>
              <Link
                to="/"
                className="font-semibold hover:text-yellow-500 hover:underline"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="font-semibold hover:text-yellow-500 hover:underline"
              >
                Contact
              </Link>
            </li>
            {isLoggedIn && userRole === "ADMIN" && (
              <li>
                <Link
                  to="/admin"
                  className="font-semibold hover:text-gray-500 hover:underline"
                >
                  Admin
                </Link>
              </li>
            )}
            {isLoggedIn ? (
              <ul className="flex flex-row gap-2 mx-5">
                <li>
                  <button
                    onClick={logout}
                    className="font-semibold hover:text-red-500 text-red-400 hover:underline"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="flex flex-row gap-2 mx-2">
                <li>
                  <Link
                    to="/login"
                    className="font-semibold hover:text-yellow-500 hover:underline md:text-sm"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="font-semibold hover:text-yellow-500 hover:underline md:text-sm"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            )}
          </ul>
        </div>
        <button onClick={toggleDarkMode} className="ml-10">
          {isDarkMode ? (
            <MdOutlineLightMode
              className="text-2xl font-bold w-[70px] stroke-3"
              style={{ color: "white" }}
            />
          ) : (
            <MdDarkMode className="text-2xl font-bold w-[70px] stroke-3" />
          )}
        </button>
        <div>
          <ConnectButton />
        </div>
        <div className="hidden lg:block">
          <div className="relative">
            <button
              onClick={() => setIsOpenProfile(!openProfile)}
              className={`flex items-center gap-2 ${
                isLoggedIn
                  ? "border-2 border-yellow-400 rounded-full p-1"
                  : "border-2 border-gray-400  rounded-full p-1"
              }`}
            >
              <img
                src={profileImage}
                alt="profile"
                className="w-10 h-10 rounded-full border-6 border-gray-100"
              />
            </button>
            <div
              className={`absolute right-0 mt-2 w-48 bg-white dark:bg-black dark:bg-opacity-80 dark:text-white rounded-lg shadow-lg transition-all duration-500 ${
                openProfile ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="p-4">
                {isLoggedIn ? (
                  <div>
                    <p className="text-gray-500 pb-2 dark:text-yellow-400">
                      @{username}
                    </p>
                    <hr />
                  </div>
                ) : (
                  <p className="text-gray-500 pb-2 dark:text-yellow-400">
                    Guest
                  </p>
                )}
                <Link
                  to="/"
                  className="block text-md font-semibold text-cyan-950 dark:text-white py-1"
                  onClick={() => setIsOpenProfile(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/about"
                  className="block text-md font-semibold text-cyan-950 dark:text-white py-1"
                  onClick={() => setIsOpenProfile(false)}
                >
                  Settings
                </Link>
                {isLoggedIn ? (
                  <Link
                    className="block text-md font-semibold text-red-600 py-1"
                    onClick={logout}
                  >
                    Logout
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="block text-md font-semibold text-cyan-950 dark:text-green-600 py-1"
                    onClick={() => setIsOpenProfile(false)}
                  >
                    Login
                  </Link>
                )}
                <div className="mt-2">
                  <p className="mb-2">
                    Status:{" "}
                    <span
                      className={
                        isConnected
                          ? "text-green-500 font-semibold"
                          : "text-red-500"
                      }
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </p>
                  <p className="mb-2">
                    Address:{" "}
                    <span className="block w-full break-words bg-gray-100 p-2 rounded-md">
                      {address}
                    </span>
                  </p>
                  <p className="mb-2">
                    Balance:{" "}
                    <span className="font-semibold">
                      {balanceData?.formatted} {balanceData?.symbol}
                    </span>
                  </p>
                  <p
                    onClick={disconnect}
                    className="mb-2 text-red-500 hover:text-red-600 hover:underline hover:cursor-pointer"
                  >
                    Disconnect
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpenDropdown(!openDropdown)}
          className="lg:hidden"
        >
          <HiMiniBars3 className="text-3xl font-bold" />
        </button>
      </div>
      <div
        className={`flex flex-col items-center space-y-2 absolute top-[75px] left-0 right-0 mx-auto z-10 bg-gray-100 dark:bg-blue-950 dark:bg-opacity-80 dark:text-white p-2 transition-all duration-500 lg:hidden ${
          openDropdown ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <Link
          to="/"
          className="text-md font-semibold text-cyan-950 dark:text-white"
          onClick={() => {
            setIsOpenDropdown(false);
          }}
        >
          Home
        </Link>
        <Link
          to="/contact"
          className="text-md font-semibold text-cyan-950 dark:text-white"
          onClick={() => {
            setIsOpenDropdown(false);
          }}
        >
          Contacts
        </Link>
        {isLoggedIn && userRole === "ADMIN" && (
          <Link
            to="/adminPage"
            className="font-semibold text-cyan-950 dark:text-white hover:underline"
            onClick={() => {
              setIsOpenDropdown(false);
            }}
          >
            Admin
          </Link>
        )}
        {isLoggedIn ? (
          <Link
            className="text-md font-semibold text-red-500 dark:text-red-500"
            onClick={() => {
              logout();
              setIsOpenDropdown(false);
            }}
          >
            Logout
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-md font-semibold text-cyan-950 dark:text-white"
            onClick={() => {
              setIsOpenDropdown(false);
            }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
