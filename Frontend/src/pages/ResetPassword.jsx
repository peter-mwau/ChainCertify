import { useState } from "react";
import { DarkModeContext } from "../contexts/themeContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const ResetPassword = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { api } = useAuth();

  const logoSrc = isDarkMode ? "/Africa1.jpg" : "Africa1.jpg";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      email,
      password,
      confirmPassword,
    };

    try {
      const response = await api.post("/api/update-password", { formData });

      const data = await response.data;

      console.log(data);

      setSuccess("Password updated successfully.");
      setError("");

      // set navigate after 2s
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      console.log("Success Message: ", success);
    } catch (error) {
      setError(error.message);
      setSuccess("");
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-cyan-900 transition-all duration-1000 pt-[100px] lg:pt-[10px]">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img className="w-[100px] p-3" src={logoSrc} />
        </a>
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-blue-950 dark:shadow-md dark:shadow-white dark:border-gray-700 sm:p-8">
          <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Change Password
          </h2>
          <form
            className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
            onSubmit={handleSubmit}
          >
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-500">{success}</div>}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Confirm password
              </label>
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-yello-500 dark:focus:border-yello-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full text-white bg-cyan-950 dark:bg-yellow-500 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-gray-900 dark:hover:bg-yellow-500 dark:focus:ring-primary-800"
            >
              Reset password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
