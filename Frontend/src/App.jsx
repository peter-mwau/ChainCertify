import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminPage";
import EditQuiz from "./components/EditQuiz";
import TakeQuiz from "./components/TakeQuiz";
import Contact from "./pages/Contact";
import ErrorPage404 from "./components/404";
import ProtectedRoute from "./components/ProtectedRoute";
import Certificate from "./components/Certificate";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/quizzes/:quizId" element={<EditQuiz />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="*" element={<ErrorPage404 />} />
      </Routes>
    </>
  );
}

export default App;
