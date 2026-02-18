import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Building2 } from 'lucide-react';
import './Navigation.css';

export default function Navigation() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/employees', icon: Users, label: 'Employees' },
        { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    ];

    return (
        <nav className="navigation">
            <div className="nav-header">
                <div className="nav-logo">
                    <div className="logo-icon">
                        <Building2 size={24} />
                    </div>
                    <div className="logo-text">
                        <span className="logo-title">HRMS</span>
                        <span className="logo-subtitle">Lite</span>
                    </div>
                </div>
            </div>

            <div className="nav-links">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        title={label}
                        className={`nav-link ${isActive(to) ? 'active' : ''}`}
                    >
                        <span className="nav-icon">
                            <Icon size={20} />
                        </span>
                        <span className="nav-label">{label}</span>
                    </Link>
                ))}
            </div>

            <div className="nav-footer">
                <div className="nav-footer-content">
                    <span className="footer-version">v1.0.0</span>
                    <span className="footer-copyright">&copy; {new Date().getFullYear()}</span>
                </div>
            </div>
        </nav>
    );
}