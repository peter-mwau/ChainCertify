import { useState } from "react";

const Settings = () => {
  const [appName, setAppName] = useState("Assign Track");
  const [appVersion, setAppVersion] = useState("1.0.0");
  const [appDescription, setAppDescription] = useState(
    "AssignTrack is a comprehensive assignment management system that enables students to submit their assignments and quizzes for marking and grading. The system simplifies workflows for both students and instructors, making assignment submissions, reviews, and grading more efficient."
  );

  const handleSaveSettings = () => {
    // Logic to save settings
    console.log("Settings saved:", { appName, appVersion });
  };

  return (
    <div className="mx-auto container justify-center items-center">
      <h2 className="text-3xl font-bold mb-4 dark:text-gray-200">Settings</h2>
      <div className="mb-4">
        <label className="block mb-2 dark:text-gray-200">
          Application Name
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="border rounded p-2 w-full bg-transparent dark:shadow-white shadow-md dark:text-white font-semibold"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 dark:text-gray-200">
          Application Description
        </label>
        <input
          type="text"
          value={appDescription}
          onChange={(e) => setAppDescription(e.target.value)}
          className="border rounded p-2 w-full bg-transparent dark:shadow-white shadow-md dark:text-white font-semibold"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 dark:text-gray-200">
          Application Version
        </label>
        <input
          type="text"
          value={appVersion}
          onChange={(e) => setAppVersion(e.target.value)}
          className="border rounded p-2 w-full bg-transparent dark:shadow-white shadow-md dark:text-white font-semibold"
        />
      </div>
      <button
        onClick={handleSaveSettings}
        className="bg-cyan-950 dark:bg-yellow-500 text-white p-2 rounded"
      >
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
