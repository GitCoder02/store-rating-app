import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { SortHeader } from '../components/SortableTable';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import { Search, Star, Edit3, Plus, RotateCcw, AlertCircle, CheckCircle2, Store, MapPin } from 'lucide-react';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'name', order: 'ASC' });

  // Rating Modal state
  const [activeStore, setActiveStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getUserStores({
        search,
        sortBy: sort.field,
        sortOrder: sort.order,
      });
      setStores(data.stores);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const openRatingModal = (store) => {
    setActiveStore(store);
    setSelectedRating(store.user_rating ? Number(store.user_rating) : 0);
    setModalError('');
    setModalSuccess('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!activeStore) return;

    if (selectedRating < 1 || selectedRating > 5) {
      setModalError('Please select a rating between 1 and 5 stars');
      return;
    }

    setModalError('');
    setModalSuccess('');
    setSubmittingRating(true);

    try {
      await api.submitRating({
        storeId: activeStore.id,
        rating: selectedRating,
      });

      setModalSuccess('Rating saved successfully!');
      loadStores();
      setTimeout(() => {
        setActiveStore(null);
        setModalSuccess('');
      }, 1000);
    } catch (err) {
      setModalError(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Store Directory & Ratings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse registered neighborhood stores, submit ratings (1 to 5 stars), or modify your existing reviews
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs self-start">
          <Store size={15} className="text-emerald-600" />
          <span>{stores.length} Registered Stores</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by Name or Street Address..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortHeader label="Store Name" field="name" currentSort={sort} onSort={handleSort} />
                <SortHeader label="Address" field="address" currentSort={sort} onSort={handleSort} />
                <SortHeader label="Overall Rating" field="overall_rating" currentSort={sort} onSort={handleSort} />
                <SortHeader label="My Rating" field="user_rating" currentSort={sort} onSort={handleSort} />
                <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">Loading stores...</td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No stores found matching your query
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const hasRated = store.user_rating !== null && store.user_rating !== undefined;

                  return (
                    <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                            <Store size={15} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {store.name}
                            </p>
                            <p className="text-xs text-slate-500">{store.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={store.address}>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{store.address}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <RatingStars value={Number(store.overall_rating)} size={15} />
                          <span className="font-bold text-slate-800 text-xs">
                            {Number(store.overall_rating) > 0 ? Number(store.overall_rating).toFixed(1) : 'Not rated'}
                          </span>
                          {store.total_ratings > 0 && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              ({store.total_ratings} {store.total_ratings === 1 ? 'review' : 'reviews'})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {hasRated ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            <span>{store.user_rating} ★ (Submitted)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not rated yet</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openRatingModal(store)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs ${
                            hasRated
                              ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {hasRated ? <Edit3 size={13} /> : <Plus size={13} />}
                          <span>{hasRated ? 'Modify Rating' : 'Rate Store'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RATING SUBMIT / MODIFY MODAL */}
      <Modal
        isOpen={Boolean(activeStore)}
        onClose={() => setActiveStore(null)}
        title={activeStore?.user_rating ? 'Modify Your Store Review' : 'Rate This Store'}
      >
        {activeStore && (
          <form onSubmit={handleRatingSubmit} className="space-y-5">
            {modalError && (
              <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-bold text-slate-900 text-sm">{activeStore.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{activeStore.address}</p>
            </div>

            <div className="text-center py-3 space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {selectedRating === 0 ? 'Click a star to choose your rating' : 'Your Rating Score'}
              </label>
              <div className="flex justify-center pt-1">
                <RatingStars
                  value={selectedRating}
                  interactive={true}
                  onChange={setSelectedRating}
                  size={36}
                  showLabel={true}
                />
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {selectedRating === 0 ? (
                  <span className="text-slate-400 italic text-xs">No rating selected (1 to 5 stars)</span>
                ) : (
                  <span className="text-slate-900 font-bold">{selectedRating} out of 5 stars</span>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStore(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRating || selectedRating === 0}
                className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submittingRating
                  ? 'Saving...'
                  : activeStore.user_rating
                  ? 'Update Rating'
                  : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
