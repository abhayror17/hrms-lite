import { useAlert } from '../context/AlertContext';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './Alerts.css';

function Alerts() {
  const { alerts, removeAlert } = useAlert();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle />;
      case 'danger': return <FaExclamationCircle />;
      case 'warning': return <FaExclamationTriangle />;
      default: return <FaInfoCircle />;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="alerts-container">
      {alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.type} alert-dismissible fade show custom-alert`}>
          <span className="alert-icon">{getIcon(alert.type)}</span>
          <span className="alert-message">{alert.message}</span>
          <button type="button" className="btn-close" onClick={() => removeAlert(alert.id)}></button>
        </div>
      ))}
    </div>
  );
}

export default Alerts;
