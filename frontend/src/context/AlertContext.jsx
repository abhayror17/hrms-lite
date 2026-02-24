import { useState, useContext, createContext } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const success = (message) => addAlert(message, 'success');
  const error = (message) => addAlert(message, 'danger');
  const warning = (message) => addAlert(message, 'warning');
  const info = (message) => addAlert(message, 'info');

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, success, error, warning, info }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
