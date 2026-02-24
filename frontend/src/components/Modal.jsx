import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-content-custom modal-${size}`}>
        <div className="modal-header-custom">
          <h5 className="modal-title-custom">{title}</h5>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body-custom">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
