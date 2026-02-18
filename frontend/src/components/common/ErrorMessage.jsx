import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="error-state">
            <div className="error-icon">
                <AlertCircle size={32} />
            </div>
            <h3>Something went wrong</h3>
            <p>{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn btn-secondary retry-btn">
                    <RefreshCw size={16} />
                    Try Again
                </button>
            )}
        </div>
    );
}