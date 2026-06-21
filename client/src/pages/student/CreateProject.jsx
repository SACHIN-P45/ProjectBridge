import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../store/slices/projectSlice';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  PlusCircle, Upload, X, Tag, Calendar, DollarSign, FileText,
  ChevronRight, ChevronLeft, Check, Globe, Smartphone, Brain,
  BarChart2, Link2, Radio, Lightbulb, Sparkles, Zap, ArrowRight,
  Loader2, Code2, Info, Target, Clock, Layers, FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Data ── */
const TECH_OPTS = [
  'React','Next.js','Vue.js','Angular','Node.js','Express','Django','Flask',
  'Python','MongoDB','PostgreSQL','MySQL','Firebase','GraphQL','Docker',
  'AWS','TensorFlow','Machine Learning','Flutter','React Native',
  'Tailwind CSS','TypeScript','Redis','Kubernetes','Solidity',
];

const CATEGORIES = [
  { value: 'web',           label: 'Web App',       emoji: '🌐', icon: Globe,       grad: 'linear-gradient(135deg,#3b82f6,#6366f1)',   desc: 'Websites, portals, SaaS' },
  { value: 'mobile',        label: 'Mobile',         emoji: '📱', icon: Smartphone,  grad: 'linear-gradient(135deg,#ec4899,#f43f5e)',   desc: 'iOS, Android, Cross-platform' },
  { value: 'ml',            label: 'ML / AI',        emoji: '🤖', icon: Brain,       grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)',   desc: 'AI, machine learning models' },
  { value: 'data-science',  label: 'Data Science',  emoji: '📊', icon: BarChart2,   grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)',   desc: 'Analytics, visualization' },
  { value: 'blockchain',    label: 'Blockchain',     emoji: '⛓️', icon: Link2,       grad: 'linear-gradient(135deg,#f59e0b,#ef4444)',   desc: 'Smart contracts, DApps' },
  { value: 'iot',           label: 'IoT',            emoji: '📡', icon: Radio,       grad: 'linear-gradient(135deg,#10b981,#06b6d4)',   desc: 'Hardware, embedded systems' },
  { value: 'other',         label: 'Other',          emoji: '💡', icon: Lightbulb,   grad: 'linear-gradient(135deg,#64748b,#475569)',   desc: 'Scripting, tools, APIs' },
];

const STEPS = [
  { id: 1, label: 'Basics',      icon: Sparkles, desc: 'Title & category' },
  { id: 2, label: 'Details',     icon: FileText,  desc: 'Description & tech' },
  { id: 3, label: 'Budget',      icon: DollarSign,desc: 'Budget & timeline' },
  { id: 4, label: 'Attachments', icon: Upload,    desc: 'Files & publish' },
];

/* ── Budget preset buttons ── */
const BUDGET_PRESETS = [5000, 10000, 25000, 50000, 100000];

/* ── Completion check ── */
function getCompletion(form) {
  let done = 0;
  if (form.title.trim().length >= 5) done++;
  if (form.category) done++;
  if (form.description.trim().length >= 30) done++;
  if (form.techStack.length > 0) done++;
  if (form.budget) done++;
  if (form.deadline) done++;
  return Math.round((done / 6) * 100);
}

/* ════════════════════════════
   MAIN COMPONENT
════════════════════════════ */
export default function CreateProject() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector(s => s.projects);

  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ title: '', description: '', techStack: [], budget: '', deadline: '', category: 'web' });
  const [files, setFiles]     = useState([]);
  const [techInput, setTechInput] = useState('');
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef(null);

  /* ── tech helpers ── */
  const addTech    = t => { if (t && !form.techStack.includes(t)) setForm(f => ({ ...f, techStack: [...f.techStack, t] })); };
  const removeTech = t => setForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }));

  /* ── file helpers ── */
  const addFiles = (list) => setFiles(prev => [...prev, ...Array.from(list)].slice(0, 5));
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  /* ── validation per step ── */
  const canNext = () => {
    if (step === 1) return form.title.trim().length >= 5 && form.category;
    if (step === 2) return form.description.trim().length >= 30 && form.techStack.length > 0;
    if (step === 3) return form.budget >= 100 && form.deadline;
    return true;
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'techStack') fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    files.forEach(f => fd.append('attachments', f));
    const res = await dispatch(createProject(fd));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('🎉 Project posted! Bids will start coming in soon.');
      navigate('/student/projects');
    } else {
      toast.error(res.payload || 'Failed to post project');
    }
  };

  const completion  = getCompletion(form);
  const activeCat   = CATEGORIES.find(c => c.value === form.category);
  const daysToDeadline = form.deadline ? Math.ceil((new Date(form.deadline) - new Date()) / 86400000) : null;

  return (
    <DashboardLayout title="Post New Project">
      <style>{`
        /* ── Layout ── */
        .cp-wrap { display: grid; grid-template-columns: 1fr 280px; gap: 24px; max-width: 1000px; margin: 0 auto; }
        @media (max-width: 900px) { .cp-wrap { grid-template-columns: 1fr; } }

        /* ── Progress stepper ── */
        .cp-stepper {
          display: flex; align-items: center; justify-content: center; gap: 0;
          padding: 20px 28px; border-radius: 18px; background: var(--card); border: 1px solid var(--border); margin-bottom: 20px;
        }
        .cp-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
        .cp-step-bubble {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--border); background: var(--bg-secondary);
          transition: all .35s cubic-bezier(.4,0,.2,1); position: relative;
        }
        .cp-step-bubble.done    { background: linear-gradient(135deg,#10b981,#059669); border-color: transparent; box-shadow: 0 0 0 4px rgba(16,185,129,0.15); }
        .cp-step-bubble.current { background: linear-gradient(135deg,#6366f1,#8b5cf6); border-color: transparent; box-shadow: 0 0 0 5px rgba(99,102,241,0.2), 0 0 18px rgba(99,102,241,0.35); animation: cpPulse 2s ease-in-out infinite; }
        @keyframes cpPulse { 0%,100%{box-shadow:0 0 0 5px rgba(99,102,241,0.2),0 0 18px rgba(99,102,241,0.3);}50%{box-shadow:0 0 0 8px rgba(99,102,241,0.12),0 0 28px rgba(99,102,241,0.5);} }
        .cp-step-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-align: center; transition: color .2s; }
        .cp-step-label.current { color: #6366f1; }
        .cp-step-label.done    { color: #10b981; }
        .cp-step-connector { flex: 1; height: 2px; background: var(--border); border-radius: 999px; margin-bottom: 22px; transition: background .4s; max-width: 60px; }
        .cp-step-connector.done { background: linear-gradient(90deg,#10b981,#34d399); }

        /* ── Form card ── */
        .cp-card {
          border-radius: 22px; background: var(--card); border: 1px solid var(--border);
          padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          animation: cpFadeIn .35s ease; position: relative; overflow: hidden;
        }
        @keyframes cpFadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .cp-card-glow {
          position: absolute; top: -80px; right: -80px; width: 240px; height: 240px; border-radius: 50%;
          filter: blur(80px); pointer-events: none; opacity: 0.07;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
        }
        .cp-step-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; position: relative; z-index: 1; }
        .cp-step-hicon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#6366f1,#8b5cf6); flex-shrink: 0; }
        .cp-step-htitle { font-size: 22px; font-weight: 900; color: var(--text); letter-spacing: -.5px; margin-bottom: 3px; }
        .cp-step-hsub { font-size: 13px; color: var(--text-muted); }

        /* ── Field ── */
        .cp-field { margin-bottom: 22px; position: relative; z-index: 1; }
        .cp-label {
          display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 8px;
        }
        .cp-label-req { color: #6366f1; }
        .cp-input {
          width: 100%; padding: 13px 16px; border-radius: 13px;
          background: var(--bg-secondary); border: 2px solid var(--border);
          color: var(--text); font-size: 14px; font-weight: 500; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .cp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
        .cp-input::placeholder { color: var(--text-muted); }
        .cp-input-icon-wrap { position: relative; }
        .cp-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .cp-input.has-icon { padding-left: 42px; }
        .cp-hint { font-size: 11px; color: var(--text-muted); margin-top: 5px; display: flex; align-items: center; gap: 5px; }

        /* ── Category grid ── */
        .cp-cat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        @media (max-width: 640px) { .cp-cat-grid { grid-template-columns: repeat(2,1fr); } }
        .cp-cat-btn {
          border-radius: 14px; padding: 14px 10px; text-align: center; cursor: pointer;
          border: 2px solid var(--border); background: var(--bg-secondary);
          transition: all .2s; display: flex; flex-direction: column; align-items: center; gap: 7px;
        }
        .cp-cat-btn:hover { border-color: rgba(99,102,241,0.4); }
        .cp-cat-btn.active { border-color: transparent; }
        .cp-cat-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .cp-cat-emoji { font-size: 22px; line-height: 1; }
        .cp-cat-label { font-size: 11px; font-weight: 800; color: var(--text); }
        .cp-cat-desc  { font-size: 10px; color: var(--text-muted); line-height: 1.3; }

        /* ── Tech stack ── */
        .cp-tech-selected { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 12px; min-height: 32px; }
        .cp-tech-tag {
          display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 8px;
          background: rgba(99,102,241,0.1); border: 1.5px solid rgba(99,102,241,0.25);
          font-size: 12px; font-weight: 700; color: #6366f1;
        }
        .cp-tech-tag-x { cursor: pointer; opacity: .7; transition: opacity .15s; }
        .cp-tech-tag-x:hover { opacity: 1; color: #ef4444; }
        .cp-tech-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .cp-tech-suggest {
          padding: 5px 11px; border-radius: 8px; font-size: 11px; font-weight: 700;
          border: 1.5px solid var(--border); background: var(--bg-secondary); color: var(--text-muted);
          cursor: pointer; transition: all .15s;
        }
        .cp-tech-suggest:hover { border-color: rgba(99,102,241,0.5); color: #6366f1; background: rgba(99,102,241,0.05); }

        /* ── Budget presets ── */
        .cp-budget-presets { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
        .cp-budget-preset {
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
          border: 1.5px solid var(--border); background: var(--bg-secondary); color: var(--text-muted);
          cursor: pointer; transition: all .15s;
        }
        .cp-budget-preset:hover { border-color: rgba(16,185,129,0.5); color: #10b981; background: rgba(16,185,129,0.05); }
        .cp-budget-preset.active { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.1); }

        /* ── File dropzone ── */
        .cp-dropzone {
          border: 2px dashed var(--border); border-radius: 16px; padding: 36px 20px;
          text-align: center; cursor: pointer; transition: all .2s;
          background: var(--bg-secondary);
        }
        .cp-dropzone:hover, .cp-dropzone.dragging {
          border-color: #6366f1; background: rgba(99,102,241,0.05);
        }
        .cp-dropzone-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .cp-file-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px;
          background: var(--bg-secondary); border: 1.5px solid var(--border); margin-top: 8px;
        }
        .cp-file-icon { width: 34px; height: 34px; border-radius: 10px; background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cp-file-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cp-file-size { font-size: 11px; color: var(--text-muted); font-weight: 500; flex-shrink: 0; }
        .cp-file-rm { cursor: pointer; color: var(--text-muted); transition: color .15s; flex-shrink: 0; }
        .cp-file-rm:hover { color: #ef4444; }

        /* ── Navigation ── */
        .cp-nav { display: flex; gap: 10px; margin-top: 28px; position: relative; z-index: 1; }
        .cp-btn-back {
          padding: 13px 22px; border-radius: 13px; font-size: 14px; font-weight: 700;
          background: var(--bg-secondary); border: 2px solid var(--border); color: var(--text);
          cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all .2s;
        }
        .cp-btn-back:hover { border-color: rgba(99,102,241,0.4); }
        .cp-btn-next {
          flex: 1; padding: 13px 22px; border-radius: 13px; font-size: 14px; font-weight: 800;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 6px 20px rgba(99,102,241,0.4); transition: opacity .2s, transform .2s;
        }
        .cp-btn-next:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
        .cp-btn-next:disabled { opacity: .45; cursor: not-allowed; transform: none; }
        .cp-btn-submit {
          flex: 1; padding: 13px 22px; border-radius: 13px; font-size: 14px; font-weight: 800;
          background: linear-gradient(135deg,#10b981,#059669); color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 6px 20px rgba(16,185,129,0.4); transition: opacity .2s, transform .2s;
        }
        .cp-btn-submit:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
        .cp-btn-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        /* ── Sidebar ── */
        .cp-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .cp-sidebar-panel { border-radius: 18px; padding: 18px; background: var(--card); border: 1px solid var(--border); }
        .cp-sidebar-title { font-size: 13px; font-weight: 800; color: var(--text); margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }

        /* ── Completion ring ── */
        .cp-ring-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 8px 0 4px; }
        .cp-ring-desc { font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.5; }

        /* ── Preview card ── */
        .cp-preview-title { font-size: 14px; font-weight: 800; color: var(--text); margin-bottom: 10px; line-height: 1.35; }
        .cp-preview-row { display: flex; align-items: center; gap: 6px; padding: 6px 0; border-top: 1px solid var(--border); }
        .cp-preview-key { font-size: 11px; color: var(--text-muted); font-weight: 600; flex: 1; }
        .cp-preview-val { font-size: 12px; font-weight: 800; color: var(--text); }

        /* ── Tips ── */
        .cp-tip { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: 10px; background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.15); font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-top: 14px; }

        /* ── Textarea ── */
        .cp-textarea { resize: none; min-height: 130px; }

        /* ── Char counter ── */
        .cp-char { font-size: 11px; color: var(--text-muted); text-align: right; margin-top: 4px; }
        .cp-char.ok { color: #10b981; }

        /* Animations */
        @keyframes cpFadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
        .cp-fu1{animation:cpFadeUp .4s ease .04s forwards;opacity:0;}
        .cp-fu2{animation:cpFadeUp .4s ease .09s forwards;opacity:0;}
      `}</style>

      {/* ── Step progress bar ── */}
      <div className="cp-stepper cp-fu1">
        {STEPS.map((s, i) => {
          const state = step > s.id ? 'done' : step === s.id ? 'current' : 'pending';
          const Icon  = s.icon;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className="cp-step">
                <div className={`cp-step-bubble ${state}`}>
                  {state === 'done'
                    ? <Check size={17} color="#fff" />
                    : <Icon size={16} color={state === 'current' ? '#fff' : 'var(--text-muted)'} />
                  }
                </div>
                <span className={`cp-step-label ${state}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`cp-step-connector ${state === 'done' ? 'done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Main layout ── */}
      <div className="cp-wrap cp-fu2">

        {/* ── FORM CARD ── */}
        <div className="cp-card" key={step}>
          <div className="cp-card-glow" />

          {/* ══ STEP 1: Basics ══ */}
          {step === 1 && (
            <>
              <div className="cp-step-header">
                <div className="cp-step-hicon"><Sparkles size={24} color="#fff" /></div>
                <div>
                  <p className="cp-step-htitle">Project Basics</p>
                  <p className="cp-step-hsub">Give your project a clear name and category</p>
                </div>
              </div>

              {/* Title */}
              <div className="cp-field">
                <label className="cp-label">
                  <Tag size={13} /> Project Title <span className="cp-label-req">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="cp-input"
                  placeholder="e.g. E-Commerce Platform with AI Recommendations"
                  maxLength={100}
                />
                <div className="cp-char" style={{ color: form.title.length >= 5 ? '#10b981' : '' }}>
                  {form.title.length}/100 {form.title.length >= 5 && '✓'}
                </div>
                <div className="cp-hint"><Info size={11} /> Be specific — a great title attracts more quality bids.</div>
              </div>

              {/* Category */}
              <div className="cp-field">
                <label className="cp-label">
                  <Layers size={13} /> Category <span className="cp-label-req">*</span>
                </label>
                <div className="cp-cat-grid">
                  {CATEGORIES.map(cat => {
                    const active = form.category === cat.value;
                    return (
                      <button
                        key={cat.value} type="button"
                        onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                        className={`cp-cat-btn ${active ? 'active' : ''}`}
                        style={active ? { background: cat.grad, borderColor: 'transparent', boxShadow: '0 6px 18px rgba(99,102,241,0.3)' } : {}}
                      >
                        <div className="cp-cat-icon" style={{ background: active ? 'rgba(255,255,255,0.2)' : cat.grad }}>
                          <span className="cp-cat-emoji">{cat.emoji}</span>
                        </div>
                        <span className="cp-cat-label" style={{ color: active ? '#fff' : '' }}>{cat.label}</span>
                        <span className="cp-cat-desc" style={{ color: active ? 'rgba(255,255,255,0.7)' : '' }}>{cat.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ══ STEP 2: Details ══ */}
          {step === 2 && (
            <>
              <div className="cp-step-header">
                <div className="cp-step-hicon"><FileText size={24} color="#fff" /></div>
                <div>
                  <p className="cp-step-htitle">Project Details</p>
                  <p className="cp-step-hsub">Describe what you need and the tech stack</p>
                </div>
              </div>

              {/* Description */}
              <div className="cp-field">
                <label className="cp-label">
                  <FileText size={13} /> Description <span className="cp-label-req">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="cp-input cp-textarea"
                  rows={6}
                  placeholder="Describe your project requirements in detail — features, functionality, design preferences, integrations, and any specific technical requirements..."
                />
                <div className={`cp-char ${form.description.length >= 30 ? 'ok' : ''}`}>
                  {form.description.length} chars {form.description.length >= 30 ? '✓ Good length' : '(min 30)'}
                </div>
                <div className="cp-tip">
                  <Info size={13} color="#6366f1" style={{ flexShrink: 0, marginTop: 1 }} />
                  Include your expected deliverables, any reference links, and preferred timeline details for better proposals.
                </div>
              </div>

              {/* Tech stack */}
              <div className="cp-field">
                <label className="cp-label">
                  <Code2 size={13} /> Technology Stack <span className="cp-label-req">*</span>
                </label>
                {form.techStack.length > 0 && (
                  <div className="cp-tech-selected">
                    {form.techStack.map(t => (
                      <span key={t} className="cp-tech-tag">
                        {t}
                        <span className="cp-tech-tag-x" onClick={() => removeTech(t)}><X size={12} /></span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="cp-input-icon-wrap">
                  <Code2 size={15} className="cp-input-icon" />
                  <input
                    type="text"
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); addTech(techInput.trim()); setTechInput(''); }
                    }}
                    className="cp-input has-icon"
                    placeholder="Type technology and press Enter…"
                  />
                </div>
                <div className="cp-tech-suggestions">
                  {TECH_OPTS.filter(t => !form.techStack.includes(t)).slice(0, 14).map(t => (
                    <button key={t} type="button" onClick={() => addTech(t)} className="cp-tech-suggest">
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ STEP 3: Budget & Timeline ══ */}
          {step === 3 && (
            <>
              <div className="cp-step-header">
                <div className="cp-step-hicon"><DollarSign size={24} color="#fff" /></div>
                <div>
                  <p className="cp-step-htitle">Budget & Timeline</p>
                  <p className="cp-step-hsub">Set your budget and project deadline</p>
                </div>
              </div>

              {/* Budget */}
              <div className="cp-field">
                <label className="cp-label">
                  <DollarSign size={13} /> Budget (₹) <span className="cp-label-req">*</span>
                </label>
                <div className="cp-input-icon-wrap">
                  <span className="cp-input-icon" style={{ fontWeight: 800, fontSize: 15, color: '#10b981' }}>₹</span>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="cp-input has-icon"
                    placeholder="10000"
                    min={100}
                  />
                </div>
                <div className="cp-budget-presets">
                  {BUDGET_PRESETS.map(p => (
                    <button
                      key={p} type="button"
                      onClick={() => setForm(f => ({ ...f, budget: String(p) }))}
                      className={`cp-budget-preset ${Number(form.budget) === p ? 'active' : ''}`}
                    >
                      ₹{p.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <div className="cp-hint"><Info size={11} /> Developers bid based on your listed budget. Set a fair amount for quality work.</div>
              </div>

              {/* Deadline */}
              <div className="cp-field">
                <label className="cp-label">
                  <Calendar size={13} /> Project Deadline <span className="cp-label-req">*</span>
                </label>
                <div className="cp-input-icon-wrap">
                  <Calendar size={15} className="cp-input-icon" />
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="cp-input has-icon"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {daysToDeadline !== null && (
                  <div className="cp-hint" style={{ color: daysToDeadline < 7 ? '#f59e0b' : '#10b981' }}>
                    <Clock size={11} />
                    {daysToDeadline} day{daysToDeadline !== 1 ? 's' : ''} from today
                    {daysToDeadline < 7 && ' — very tight timeline!'}
                  </div>
                )}
              </div>

              {/* Summary preview */}
              <div style={{ padding: '16px', borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginTop: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>📋 Project Summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { k: 'Title', v: form.title || '—' },
                    { k: 'Category', v: activeCat?.label || '—' },
                    { k: 'Tech Stack', v: form.techStack.slice(0, 3).join(', ') + (form.techStack.length > 3 ? ` +${form.techStack.length - 3}` : '') || '—' },
                  ].map(({ k, v }) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ STEP 4: Attachments & Submit ══ */}
          {step === 4 && (
            <>
              <div className="cp-step-header">
                <div className="cp-step-hicon"><Upload size={24} color="#fff" /></div>
                <div>
                  <p className="cp-step-htitle">Attachments & Publish</p>
                  <p className="cp-step-hsub">Upload files and post your project</p>
                </div>
              </div>

              {/* Dropzone */}
              <div className="cp-field">
                <label className="cp-label">
                  <Upload size={13} /> Attachments <span style={{ color: 'var(--text-muted)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(Optional — max 5)</span>
                </label>
                <div
                  className={`cp-dropzone ${dragging ? 'dragging' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="cp-dropzone-icon">
                    <Upload size={26} color="#6366f1" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                    Drag & drop files here, or <span style={{ color: '#6366f1' }}>browse</span>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF, DOC, DOCX — up to 50 MB each</p>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx" onChange={e => addFiles(e.target.files)} className="hidden" />
                </div>

                {files.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {files.map((f, i) => (
                      <div key={i} className="cp-file-item">
                        <div className="cp-file-icon"><FileText size={16} color="#6366f1" /></div>
                        <span className="cp-file-name">{f.name}</span>
                        <span className="cp-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                        <span className="cp-file-rm" onClick={() => setFiles(prev => prev.filter((_,j) => j !== i))}><X size={15} /></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Final summary */}
              <div style={{ padding: 18, borderRadius: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))', border: '1.5px solid rgba(99,102,241,0.2)', marginBottom: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#6366f1', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={15} /> Ready to publish
                </p>
                {[
                  { k: 'Title',     v: form.title },
                  { k: 'Category', v: activeCat?.label },
                  { k: 'Budget',   v: form.budget ? `₹${Number(form.budget).toLocaleString('en-IN')}` : '—' },
                  { k: 'Deadline', v: form.deadline ? `${daysToDeadline}d from today` : '—' },
                  { k: 'Tech Stack',v: `${form.techStack.length} technologies` },
                  { k: 'Files',    v: `${files.length} attached` },
                ].map(({ k, v }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: '1px solid rgba(99,102,241,0.12)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Navigation buttons ── */}
          <div className="cp-nav">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)} className="cp-btn-back">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => { if (canNext()) setStep(s => s + 1); else toast.error('Please complete all required fields'); }}
                className="cp-btn-next"
                disabled={!canNext()}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="cp-btn-submit">
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Publishing…</>
                  : <><Zap size={16} /> Publish Project &amp; Get Bids</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="cp-sidebar cp-fu2">

          {/* Completion ring */}
          <div className="cp-sidebar-panel">
            <div className="cp-sidebar-title"><Target size={15} color="#6366f1" /> Completion</div>
            <div className="cp-ring-wrap">
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" style={{ opacity: .1, color: 'var(--text-muted)' }} />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={completion === 100 ? '#10b981' : '#6366f1'} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${completion / 100 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                    style={{ transition: 'stroke-dasharray .8s cubic-bezier(.4,0,.2,1)' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: completion === 100 ? '#10b981' : 'var(--text)' }}>{completion}%</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Done</span>
                </div>
              </div>
              <p className="cp-ring-desc">
                {completion < 50 ? 'Fill out the basics to get started.' : completion < 100 ? 'Looking good! Complete all fields.' : '✓ All set — ready to publish!'}
              </p>
            </div>
          </div>

          {/* Live preview */}
          <div className="cp-sidebar-panel">
            <div className="cp-sidebar-title"><FolderOpen size={15} color="#10b981" /> Live Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {activeCat && (
                <div style={{ width: 36, height: 36, borderRadius: 10, background: activeCat.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }}>{activeCat.emoji}</span>
                </div>
              )}
              <p className="cp-preview-title">{form.title || 'Your project title will appear here'}</p>
            </div>
            {[
              { k: 'Category', v: activeCat?.label || '—', color: '#6366f1' },
              { k: 'Budget',   v: form.budget ? `₹${Number(form.budget).toLocaleString('en-IN')}` : '—', color: '#10b981' },
              { k: 'Deadline', v: daysToDeadline ? `${daysToDeadline}d` : '—', color: '#f59e0b' },
              { k: 'Stack',    v: form.techStack.length ? `${form.techStack.length} tech` : '—', color: '#ec4899' },
            ].map(({ k, v, color }) => (
              <div key={k} className="cp-preview-row">
                <span className="cp-preview-key">{k}</span>
                <span className="cp-preview-val" style={{ color }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="cp-sidebar-panel">
            <div className="cp-sidebar-title"><Zap size={15} color="#f59e0b" /> Tips</div>
            {[
              'A detailed description gets 3x more qualified bids.',
              'Setting a realistic budget attracts better developers.',
              'Attach a requirements doc to reduce back-and-forth.',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 2 ? 10 : 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Check size={11} color="#f59e0b" />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
