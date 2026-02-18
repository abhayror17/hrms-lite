import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <Loader2 size={40} className="spinner-icon" />
                <span className="loading-text">Loading...</span>
            </div>
        </div>
    );
}