import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaCalendarCheck } from 'react-icons/fa';
import './BottomNav.css';

function BottomNav() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bottom-nav-item active' : 'bottom-nav-item';
    };

    return (
        <div className="bottom-nav d-md-none">
            <Link to="/" className={isActive('/')}>
                <FaTachometerAlt />
                <span>Dashboard</span>
            </Link>
            <Link to="/employees" className={isActive('/employees')}>
                <FaUsers />
                <span>Employees</span>
            </Link>
            <Link to="/attendance" className={isActive('/attendance')}>
                <FaCalendarCheck />
                <span>Attendance</span>
            </Link>
        </div>
    );
}

export default BottomNav;
