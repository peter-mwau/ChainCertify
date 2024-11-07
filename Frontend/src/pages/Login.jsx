import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BiHide, BiShowAlt } from "react-icons/bi";
import { useAuth } from "../contexts/authContext";
import { DarkModeContext } from "../contexts/themeContext";
import { Link } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, setToken, user, api } = useAuth();
  const location = useLocation();
  const { isDarkMode } = useContext(DarkModeContext);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const logoSrc = isDarkMode ? "/Africa1.jpg" : "/Africa1.jpg";

  // HandleLogin function
  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await api.post(
        "/api/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { accessToken } = response.data;
        login(accessToken); // Use the login function from AuthContext

        setSuccessMessage("Login successful!");
        setToken(accessToken);

        // Debugging - Check the intended redirect path
        console.log("Redirecting to:", location.state?.from?.pathname || "/");

        // Redirect the user after login
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        setError("Login failed: Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Login failed: ${error.response.data.error}`);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    }
  };

  // Use useEffect to navigate after successful login
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state?.from?.pathname]);

  return (
    <section className="bg-gray-50 dark:bg-cyan-900 h-[100vh] pt-[130px] md:pt-[30px] md:h-auto transition-all duration-1000">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <img className="w-[100px] p-3" src={logoSrc} />
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-cyan-900 dark:shadow-md dark:shadow-white dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-cyan-950 md:text-2xl dark:text-white">
              Login to account
            </h1>
            {/* login with google and login with github buttons */}
            <div className="flex flex-row space-x-2">
              <button
                type="button"
                className="text-cyan-950 dark:shadow-md dark:shadow-gray-100 hover:text-white bg-gray-300 hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex dark:text-gray-900 items-center dark:focus:ring-gray-500 dark:hover:bg-transparent me-2 mb-2 dark:hover:text-white"
              >
                <svg
                  className="w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign in with Github
              </button>
              <button
                type="button"
                className="text-cyan-950  dark:shadow-md dark:shadow-gray-100 hover:text-white bg-gray-300 hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:text-gray-900 dark:focus:ring-[#4285F4]/55 me-2 mb-2 dark:hover:text-white dark:hover:bg-transparent"
              >
                <svg
                  className="w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 19"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
            {/* or div to separate the two */}
            <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
              {successMessage ? (
                <p className="text-green-500 font-semibold">{successMessage}</p>
              ) : error ? (
                <p className="text-red-500 font-normal">{error}</p>
              ) : null}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Email"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-950 focus:border-cyan-950 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-800 dark:focus:ring-cyan-950 dark:focus:border-cyan-950 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  >
                    {showPassword ? (
                      <BiHide className="dark:text-white" />
                    ) : (
                      <BiShowAlt className="dark:text-white" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    aria-describedby="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-cyan-950 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    required
                  />
                </div>
                <div className="ml-3 text-sm flex flex-row space-x-[100px]">
                  <label className="font-light text-gray-500 dark:text-gray-300 items-start">
                    Remember me
                  </label>
                  <a
                    href="/resetpassword"
                    className="text-md items-end mr-2 font-medium text-yellow-500 hover:underline dark:text-purple-300"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-cyan-950 dark:bg-yellow-500 hover:bg-yellow-500 hover:text-cyan-950 focus:ring-4 focus:outline-none focus:ring-yellow-500 rounded-lg text-sm px-5 py-2.5 text-center dark:text-cyan-950 font-semibold dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Login
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:underline dark:text-yellow-500"
                >
                  Signup here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
