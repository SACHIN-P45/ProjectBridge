import { Clock, Users, Zap, ExternalLink, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  open:         { label: 'Open for Bids', dot: '#10b981', bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  'in-progress':{ label: 'In Progress',   dot: '#6366f1', bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  testing:      { label: 'Testing',        dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  delivered:    { label: 'Delivered',      dot: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  color: '#06b6d4' },
  completed:    { label: 'Completed',      dot: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
  cancelled:    { label: 'Cancelled',      dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
};

const categoryMeta = {
  web:           { emoji: '🌐', label: 'Web Dev',      grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  mobile:        { emoji: '📱', label: 'Mobile',       grad: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  ml:            { emoji: '🤖', label: 'ML / AI',      grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)' },
  'data-science':{ emoji: '📊', label: 'Data Science', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  blockchain:    { emoji: '⛓️', label: 'Blockchain',   grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  iot:           { emoji: '📡', label: 'IoT',           grad: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  other:         { emoji: '💡', label: 'Other',         grad: 'linear-gradient(135deg,#64748b,#475569)' },
};

export default function ProjectCard({ project, showActions = true, onBid, onView }) {
  const navigate  = useNavigate();
  const status    = statusConfig[project.status] || statusConfig.open;
  const cat       = categoryMeta[project.category] || categoryMeta.other;
  const daysLeft  = Math.ceil((new Date(project.deadline) - new Date()) / 86400000);
  const urgency   = daysLeft <= 3 && daysLeft > 0;
  const expired   = daysLeft <= 0;
  const budget    = project.budget?.toLocaleString('en-IN');
  const bidCount  = project.bidCount || 0;

  return (
    <div className="pb-card">
      {/* Category stripe */}
      <div className="pb-card-stripe" style={{ background: cat.grad }} />

      {/* Header row */}
      <div className="pb-card-header">
        <div className="pb-card-cat-wrap">
          <div className="pb-card-cat-icon" style={{ background: cat.grad }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.emoji}</span>
          </div>
          <span className="pb-cat-label">{cat.label}</span>
        </div>
        <div className="pb-status-chip" style={{ background: status.bg, color: status.color }}>
          <span className="pb-status-dot" style={{ background: status.dot }} />
          {status.label}
        </div>
      </div>

      {/* Title + client */}
      <div className="pb-card-body">
        <h3 className="pb-card-title">{project.title}</h3>
        {project.student && (
          <div className="pb-card-client">
            {project.student.avatar
              ? <img src={project.student.avatar} alt="" className="pb-avatar" />
              : <div className="pb-avatar-fallback">{project.student.name?.charAt(0)}</div>
            }
            <span>{project.student.name}</span>
          </div>
        )}
        <p className="pb-card-desc">{project.description}</p>
      </div>

      {/* Tech stack */}
      {project.techStack?.length > 0 && (
        <div className="pb-tech-row">
          {project.techStack.slice(0, 4).map(tech => (
            <span key={tech} className="pb-tech-chip">{tech}</span>
          ))}
          {project.techStack.length > 4 && (
            <span className="pb-tech-chip pb-tech-more">+{project.techStack.length - 4}</span>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="pb-stats-bar">
        <div className="pb-stat">
          <span className="pb-stat-label">Budget</span>
          <span className="pb-stat-val pb-stat-money">₹{budget}</span>
        </div>
        <div className="pb-stat-divider" />
        <div className="pb-stat">
          <span className="pb-stat-label">Deadline</span>
          <span className={`pb-stat-val ${urgency ? 'pb-urgent' : expired ? 'pb-expired' : ''}`}>
            <Clock size={12} />
            {expired ? 'Expired' : urgency ? `${daysLeft}d left!` : `${daysLeft}d`}
          </span>
        </div>
        <div className="pb-stat-divider" />
        <div className="pb-stat">
          <span className="pb-stat-label">Bids</span>
          <span className="pb-stat-val">
            <Users size={12} /> {bidCount}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="pb-card-actions">
          <button
            onClick={() => onView ? onView(project) : navigate(`/student/projects/${project._id}`)}
            className="pb-btn-ghost"
          >
            <ExternalLink size={14} /> Details
          </button>
          {onBid && project.status === 'open' && (
            <button onClick={() => onBid(project)} className="pb-btn-bid">
              <Zap size={14} /> Place Bid
            </button>
          )}
        </div>
      )}
    </div>
  );
}
