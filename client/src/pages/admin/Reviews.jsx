import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReviews, deleteReview } from '../../store/slices/adminSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  Star, Trash2, Calendar, Search, MessageSquare, 
  AlertTriangle, ArrowUpRight, Award, User, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const dispatch = useDispatch();
  const { reviews, loading } = useSelector((s) => s.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  const handleDelete = (reviewId) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      dispatch(deleteReview(reviewId));
      toast.success('Review deleted successfully');
    }
  };

  // Compute metrics dynamically
  const totalCount = reviews ? reviews.length : 0;
  
  const avgRating = reviews && reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  const positiveCount = reviews 
    ? reviews.filter(r => r.rating >= 4).length 
    : 0;

  const flaggedCount = reviews 
    ? reviews.filter(r => r.rating <= 2).length 
    : 0;

  // Filter reviews
  const filteredReviews = reviews ? reviews.filter(r => {
    const matchesSearch = 
      (r.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r.project?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r.reviewer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r.reviewee?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    let matchesRating = true;
    if (ratingFilter === '5') matchesRating = r.rating === 5;
    else if (ratingFilter === '4') matchesRating = r.rating === 4;
    else if (ratingFilter === '3') matchesRating = r.rating === 3;
    else if (ratingFilter === 'low') matchesRating = r.rating <= 2;

    return matchesSearch && matchesRating;
  }) : [];

  return (
    <DashboardLayout title="Reviews">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text)]">Ratings & Feedback</h1>
          <p className="text-[var(--text-muted)] mt-1">Audit student and developer project reviews, monitor platform quality, and manage feedback.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Average Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Star size={16} className="fill-amber-500" /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)] flex items-center gap-1.5">
            {avgRating} <span className="text-xs font-medium text-[var(--text-muted)]">/ 5.0</span>
          </p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Testimonials</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><MessageSquare size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{totalCount}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Positive Feedbacks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Award size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{positiveCount}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Flagged (1-2 Stars)</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center"><AlertTriangle size={16} /></div>
          </div>
          <p className={`text-2xl font-black ${flaggedCount > 0 ? 'text-red-500' : 'text-[var(--text)]'}`}>{flaggedCount}</p>
        </div>
      </div>

      {/* Toolbar & Filter container */}
      <div className="card overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col mb-8">
        
        {/* Toolbar */}
        <div className="p-4 flex flex-col lg:flex-row gap-4 justify-between bg-[var(--bg-secondary)] items-center">
          
          {/* Rating Tabs */}
          <div className="flex flex-wrap bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] w-full lg:w-auto">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: '5', label: '5 Stars' },
              { id: '4', label: '4 Stars' },
              { id: '3', label: '3 Stars' },
              { id: 'low', label: '2 Stars & Below' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRatingFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  ratingFilter === tab.id 
                    ? 'bg-brand-500 text-white shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Search reviewer, project, dev..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-[var(--text-muted)]"
            />
          </div>
        </div>
      </div>

      {/* Reviews Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-[var(--text-muted)]">
          <span className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <span className="mt-2 text-sm font-semibold">Loading Testimonials...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card p-12 text-center text-[var(--text-muted)] text-sm rounded-2xl bg-[var(--card)] border border-[var(--border)]">
          No ratings or reviews found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((r) => (
            <div 
              key={r._id} 
              className="group card p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              
              {/* Card Header: Parties Flow */}
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5 mb-4">
                  {/* Reviewer (Student) */}
                  <div className="flex items-center gap-2 min-w-0">
                    {r.reviewer?.avatar ? (
                      <img src={r.reviewer.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--border)] flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {r.reviewer?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--text)] truncate">{r.reviewer?.name || 'Student'}</p>
                      <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Student</span>
                    </div>
                  </div>

                  <ArrowRight size={14} className="text-[var(--text-muted)] mx-1.5 flex-shrink-0" />

                  {/* Reviewee (Developer) */}
                  <div className="flex items-center gap-2 min-w-0 text-right">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--text)] truncate">{r.reviewee?.name || 'Developer'}</p>
                      <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Developer</span>
                    </div>
                    {r.reviewee?.avatar ? (
                      <img src={r.reviewee.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--border)] flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {r.reviewee?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stars & Project Badge */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}
                      />
                    ))}
                    <span className="text-xs font-bold text-[var(--text)] ml-1">{r.rating}.0</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[10px] bg-[var(--bg-secondary)] border border-[var(--border)] px-2.5 py-1 rounded-lg text-[var(--text-muted)] font-semibold max-w-full">
                    <FolderOpen size={11} className="text-brand-500" />
                    <span className="truncate">{r.project?.title || 'Unknown Project'}</span>
                  </div>
                </div>

                {/* Comments Content */}
                <p className="text-sm text-[var(--text)] italic leading-relaxed pl-3 border-l-2 border-brand-500/35">
                  "{r.comment}"
                </p>
              </div>

              {/* Card Footer: Date & Delete Action */}
              <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] mt-6 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar size={14} />
                  {r.createdAt ? format(new Date(r.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </span>
                
                <button
                  onClick={() => handleDelete(r._id)}
                  className="p-1.5 rounded-lg border text-red-500 border-red-200 hover:bg-red-500 hover:text-white dark:border-red-900/30 dark:hover:bg-red-900/20 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  title="Delete Review"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
