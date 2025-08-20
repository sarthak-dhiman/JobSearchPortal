import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <ul style={{ display: "flex", gap: "20px", listStyle: "none" }}>
        <li>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
        </li>
        <li>
          <Link to="/jobs" style={{ color: "white", textDecoration: "none" }}>Jobs</Link>
        </li>
        <li>
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
        </li>
        <li>
          <Link to="/register" style={{ color: "white", textDecoration: "none" }}>Register</Link>
        </li>
        <li>
          <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>Admin</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
