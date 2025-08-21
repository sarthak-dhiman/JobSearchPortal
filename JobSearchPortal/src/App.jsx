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
import "./index.css";

function App() {
  return (
    <Router>
      <NavBar />
      <main className="main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        {}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />

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
    </Router>
  );
}

export default App;
