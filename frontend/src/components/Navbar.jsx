import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaCalendarCheck, FaBuilding } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark main-nav">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeNav}>
          <FaBuilding className="brand-icon me-2" />
          <span className="brand-text">HRMS Lite</span>
        </Link>

        <button
          className="navbar-toggler d-none"
          type="button"
          onClick={toggleNav}
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto d-none d-lg-flex">
            <li className="nav-item">
              <Link className={isActive('/')} to="/" onClick={closeNav}>
                <FaTachometerAlt className="me-1" /> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/employees')} to="/employees" onClick={closeNav}>
                <FaUsers className="me-1" /> Employees
              </Link>
            </li>
            <li className="nav-item">
              <Link className={isActive('/attendance')} to="/attendance" onClick={closeNav}>
                <FaCalendarCheck className="me-1" /> Attendance
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
