import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { SortHeader } from '../components/SortableTable';
import RatingStars from '../components/RatingStars';
import { Store, Star, MapPin, Mail, AlertCircle, Calendar } from 'lucide-react';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ field: 'rating', order: 'DESC' });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getOwnerDashboard({
        sortBy: sort.field,
        sortOrder: sort.order,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load store owner dashboard');
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-400">
        Loading store dashboard...
      </div>
    );
  }

  if (error || !data?.hasStore) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Store Assigned</h2>
        <p className="text-sm text-slate-500 mt-1">
          {error || 'Your account is registered as a Store Owner, but no store has been linked to your profile yet. Please contact the administrator.'}
        </p>
      </div>
    );
  }

  const { store, ratings } = data;

  // Calculate 5-star to 1-star distribution (Trustpilot / Google Reviews style)
  const totalReviews = ratings.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratings.filter((r) => Number(r.rating) === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Store Profile & Rating Breakdown Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Store Info */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Store size={13} />
              <span>Registered Business Profile</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {store.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                <span>{store.address}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                <span>{store.email}</span>
              </span>
            </div>
          </div>

          {/* Average Rating Score & Visual Star Breakdown Bars */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 border border-slate-200 rounded-xl p-5 shrink-0">
            {/* Score Big Display */}
            <div className="text-center sm:pr-6 sm:border-r border-slate-200">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight block">
                {Number(store.averageRating) > 0 ? Number(store.averageRating).toFixed(1) : '0.0'}
              </span>
              <div className="flex justify-center mt-1.5">
                <RatingStars value={Number(store.averageRating)} size={16} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {store.totalRatings} customer {store.totalRatings === 1 ? 'rating' : 'ratings'}
              </p>
            </div>

            {/* 5-star to 1-star Distribution Progress Bars */}
            <div className="w-48 space-y-1 text-xs">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-5 text-slate-600 font-medium">{stars}★</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-500 font-mono text-[11px]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ratings History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Customer Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customers who have rated your store with their review details
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
            {ratings.length} total reviews
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <SortHeader label="Customer Name" field="user_name" currentSort={sort} onSort={handleSort} />
                  <SortHeader label="Email Address" field="user_email" currentSort={sort} onSort={handleSort} />
                  <SortHeader label="Rating Submitted" field="rating" currentSort={sort} onSort={handleSort} />
                  <SortHeader label="Date Submitted" field="created_at" currentSort={sort} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {ratings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                      No ratings submitted for your store yet.
                    </td>
                  </tr>
                ) : (
                  ratings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{r.user_name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{r.user_email}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <RatingStars value={r.rating} size={15} />
                          <span className="text-xs font-bold text-slate-800">
                            {r.rating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>
                            {new Date(r.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
