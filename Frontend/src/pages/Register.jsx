import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiHide, BiShowAlt } from "react-icons/bi";
import { DarkModeContext } from "../contexts/themeContext";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const Register = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const { isDarkMode } = useContext(DarkModeContext);

  const logoSrc = isDarkMode ? "/Africa1.jpg" : "/Africa1.jpg";

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const { api } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await api.post("/api/register", formData);

      if (response.status === 201 || response.status === 200 || response.ok) {
        console.log("Registration successful");
        setSuccessMessage("Registration successful");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Failed to register");
      }
    } catch (error) {
      console.error("Registration failed:", error);

      // If error.response exists, it means the request was made, and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response) {
        setError(error.response.data.error || "Failed to register");
      }
      // If error.request exists but error.response does not, the request was made but no response was received
      else if (error.request) {
        setError("No response from server. Please try again later.");
      }
      // For any other kind of error, such as a network error or an error in the request configuration
      else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-cyan-900 h-[100vh] lg:p-5 transition-all duration-1000">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 pt-[80px] md:pt-[100px] md:h-auto lg:pt-[100px] lg:h-[100vh]">
        <img className="w-[100px] p-3" src={logoSrc} />
        <div className="w-full bg-white text-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-cyan-900 dark:shadow-md dark:shadow-white dark:border-gray-700">
          <div className="p-6 space-y-4 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-cyan-950 md:text-2xl dark:text-white">
              Create an account
            </h1>
            {successMessage ? (
              <p className="text-green-500 font-semibold">{successMessage}</p>
            ) : error ? (
              <p className="text-red-500 font-normal">{error}</p>
            ) : null}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-white">
                  Your names
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Official Names"
                  required
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-white">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-950 focus:border-cyan-950 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-200 dark:placeholder-gray-400 dark:text-gray-800 dark:focus:ring-cyan-950 dark:focus:border-cyan-950 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 top-6 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? (
                    <BiHide className="text-gray-900 dark:text-gray-800" />
                  ) : (
                    <BiShowAlt className="text-gray-900 dark:text-gray-800" />
                  )}
                </button>
              </div>
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-white">
                  Confirm password
                </label>
                <input
                  type={showPassword2 ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  id="confirmPassword"
                  placeholder="••••••••"
                  className="bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-950 focus:border-cyan-950 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-800 dark:focus:ring-cyan-950 dark:focus:border-cyan-950 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility2}
                  className="absolute inset-y-0 top-6 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword2 ? (
                    <BiHide className="text-gray-900 dark:text-gray-800" />
                  ) : (
                    <BiShowAlt className="text-gray-900 dark:text-gray-800" />
                  )}
                </button>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    aria-describedby="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-200 focus:ring-3 focus:ring-yellow-500 dark:bg-gray-200 dark:border-gray-600 "
                    required=""
                    style={{
                      backgroundColor: "#EAB308",
                      borderColor: "EAB308",
                    }}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-light text-gray-600 dark:text-gray-300">
                    I accept the Terms and Conditions
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-cyan-950 dark:bg-yellow-500 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 rounded-lg text-sm px-5 py-2.5 text-center dark:text-cyan-950 font-semibold dark:hover:bg-yellow-500 dark:focus:ring-yellow-800"
              >
                Sign up
              </button>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-yellow-500 hover:underline dark:text-yellow-500"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
