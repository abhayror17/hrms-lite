import { FaSpinner } from 'react-icons/fa';
import './Spinner.css';

function Spinner({ size = 'md', text = '' }) {
  const sizeClass = `spinner-${size}`;
  return (
    <div className={`spinner-wrapper ${sizeClass}`}>
      <FaSpinner className="spinner-icon" />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
}

export default Spinner;
