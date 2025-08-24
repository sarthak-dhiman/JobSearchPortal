import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import Companies from "./pages/Companies";
import JobDetails from "./pages/JobDetails";
import RecruiterPost from "./pages/RecruiterPost";
import RecruiterJobs from "./pages/RecruiterJobs";
import "./index.css";

function App() {
  return (
    <>
      <NavBar />
      <main className="main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        {}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route path="/recruiter/post" element={<RecruiterPost />} />
        <Route path="/recruiter/jobs" element={<RecruiterJobs />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/saved" element={
        <ProtectedRoute>
           <SavedJobs />
        </ProtectedRoute>
        } />
        <Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
        } />
        <Route path="/companies" element={<Companies />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
      </Routes>
      </main>
    </>
  );
}

export default App;
