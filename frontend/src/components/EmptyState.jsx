import { FaFolderOpen } from 'react-icons/fa';
import './EmptyState.css';

function EmptyState({ 
  icon: Icon = FaFolderOpen, 
  title = 'No data found', 
  description = '',
  action = null 
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon />
      </div>
      <h4 className="empty-title">{title}</h4>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
