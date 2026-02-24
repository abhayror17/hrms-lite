import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertProvider } from './context/AlertContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Alerts from './components/Alerts';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    <AlertProvider>
      <Alerts />
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/attendance" element={<Attendance />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;