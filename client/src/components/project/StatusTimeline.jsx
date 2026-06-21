import { Check, Loader, GitCommit, Zap, CheckCircle } from 'lucide-react';

const STEPS = [
  { key: 'in-progress', label: 'In Progress', desc: 'Developer working',    icon: Loader },
  { key: 'testing',     label: 'Testing',     desc: 'Under QA review',      icon: GitCommit },
  { key: 'delivered',   label: 'Delivered',   desc: 'Work submitted',        icon: Zap },
  { key: 'completed',   label: 'Completed',   desc: 'Approved & closed',     icon: CheckCircle },
];

const ORDER = ['in-progress', 'testing', 'delivered', 'completed'];

export default function StatusTimeline({ status }) {
  const cur = ORDER.indexOf(status);

  return (
    <div style={{ padding: '16px 0 4px' }}>
      <style>{`
        .stl-wrap { display: flex; align-items: flex-start; position: relative; }
        .stl-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
        .stl-connector-row { display: flex; align-items: flex-start; width: 100%; }
        .stl-connector {
          flex: 1; height: 3px; margin-top: 20px; border-radius: 999px;
          background: var(--border); transition: background 0.6s ease;
        }
        .stl-connector.done { background: linear-gradient(90deg, #10b981, #34d399); }
        .stl-connector.active { background: linear-gradient(90deg, #6366f1, rgba(99,102,241,0.3)); }
        .stl-bubble {
          width: 42px; height: 42px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2.5px solid var(--border); background: var(--card);
          transition: all 0.4s cubic-bezier(.4,0,.2,1); position: relative; flex-shrink: 0;
        }
        .stl-bubble.done {
          background: linear-gradient(135deg,#10b981,#059669);
          border-color: transparent;
          box-shadow: 0 0 0 5px rgba(16,185,129,0.15);
        }
        .stl-bubble.current {
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          border-color: transparent;
          box-shadow: 0 0 0 5px rgba(99,102,241,0.2), 0 0 18px rgba(99,102,241,0.4);
          animation: stlPulse 2.2s ease-in-out infinite;
        }
        @keyframes stlPulse {
          0%,100% { box-shadow: 0 0 0 5px rgba(99,102,241,0.2), 0 0 18px rgba(99,102,241,0.3); }
          50%      { box-shadow: 0 0 0 8px rgba(99,102,241,0.12), 0 0 28px rgba(99,102,241,0.5); }
        }
        .stl-bubble.pending { opacity: 0.45; }
        .stl-step-label { margin-top: 10px; text-align: center; }
        .stl-step-name {
          font-size: 11px; font-weight: 800; letter-spacing: .03em; white-space: nowrap;
          transition: color 0.3s;
        }
        .stl-step-name.done    { color: #10b981; }
        .stl-step-name.current { color: #6366f1; }
        .stl-step-name.pending { color: var(--text-muted); }
        .stl-step-desc {
          font-size: 10px; color: var(--text-muted); margin-top: 2px; white-space: nowrap;
        }
        .stl-current-badge {
          position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
          background: #6366f1; color: #fff; font-size: 8px; font-weight: 800;
          padding: 2px 6px; border-radius: 999px; white-space: nowrap; letter-spacing: .05em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="stl-wrap">
        {STEPS.map((step, i) => {
          const isDone    = i < cur;
          const isCurrent = i === cur;
          const isPending = i > cur;
          const Icon      = step.icon;
          const stateClass = isDone ? 'done' : isCurrent ? 'current' : 'pending';

          return (
            <div key={step.key} className="stl-connector-row" style={{ flex: 1 }}>
              <div className="stl-step">
                <div className={`stl-bubble ${stateClass}`}>
                  {isCurrent && <span className="stl-current-badge">Now</span>}
                  {isDone
                    ? <Check size={18} color="#fff" />
                    : <Icon size={16} color={isCurrent ? '#fff' : 'var(--text-muted)'} />
                  }
                </div>
                <div className="stl-step-label">
                  <p className={`stl-step-name ${stateClass}`}>{step.label}</p>
                  <p className="stl-step-desc">{step.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`stl-connector ${isDone ? 'done' : isCurrent ? 'active' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
