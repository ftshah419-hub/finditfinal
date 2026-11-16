import React, { useState, useEffect } from 'react';
import ItemCard from '../components/ItemCard';
import ItemFilters from '../components/ItemFilters';
import userApi from '../services/userApi';

export const BrowseItemsView = ({ user, onViewItem, onClaimItem }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'lost', 'found'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });

  // Counts
  const [counts, setCounts] = useState({ all: 0, lost: 0, found: 0 });

  // Load categories once
  useEffect(() => {
    userApi.getCategories().then((res) => {
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    }).catch(console.error);
  }, []);

  // Fetch items based on active filters
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (typeFilter === 'lost') params.type = 'LOST';
      if (typeFilter === 'found') params.type = 'FOUND';
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedCity) params.city = selectedCity;

      const res = await userApi.searchItems(params);
      if (res.data?.items) {
        setItems(res.data.items);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: res.data.items.length, pages: 1 });
      }

      // Also get counts for tabs
      const [allRes, lostRes, foundRes] = await Promise.all([
        userApi.searchItems({ limit: 1 }),
        userApi.searchItems({ type: 'LOST', limit: 1 }),
        userApi.searchItems({ type: 'FOUND', limit: 1 })
      ]);
      setCounts({
        all: allRes.data?.pagination?.total || 0,
        lost: lostRes.data?.pagination?.total || 0,
        found: foundRes.data?.pagination?.total || 0
      });
    } catch (err) {
      console.error('Failed to search items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeFilter, searchQuery, selectedCategory, selectedCity, pagination.page]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setDateFilter('');
    setTypeFilter('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="flex flex-col w-full gap-space-xl pb-space-2xl">
      {/* Top Intro Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-md text-label-md text-primary tracking-wider uppercase font-semibold">
              Live Institutional Registry
            </span>
          </div>
          <h1 className="font-display text-display text-on-surface tracking-tight font-bold">
            Browse Lost & Found Directory
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Search verified items discovered across campus, departments, and transit facilities.
          </p>
        </div>

        {/* Quick Status Counter Bar */}
        <div className="flex items-center gap-space-sm bg-surface-container p-1 rounded-xl shrink-0 self-start md:self-auto border border-outline-variant/30">
          <button
            onClick={() => {
              setTypeFilter('all');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Items{' '}
            <span className="ml-1 text-on-surface-variant font-code-tabular text-label-sm px-1.5 py-0.5 rounded-full bg-surface-container-high">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => {
              setTypeFilter('lost');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all cursor-pointer ${
              typeFilter === 'lost'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Lost Belongings{' '}
            <span className="ml-1 text-on-surface-variant font-code-tabular text-label-sm px-1.5 py-0.5 rounded-full bg-surface-container-high">
              {counts.lost}
            </span>
          </button>

          <button
            onClick={() => {
              setTypeFilter('found');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all cursor-pointer ${
              typeFilter === 'found'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Found Items{' '}
            <span className="ml-1 text-on-surface-variant font-code-tabular text-label-sm px-1.5 py-0.5 rounded-full bg-surface-container-high">
              {counts.found}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Console */}
      <ItemFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Catalog Grid Section */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/30 flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
            <span className="material-symbols-outlined text-[36px]">travel_explore</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            No Matching Items Found
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1">
            We couldn't find any approved records matching your search criteria. Try adjusting keywords, categories, or resetting filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-space-md px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              currentUser={user}
              onViewDetails={onViewItem}
              onClaim={onClaimItem}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-container-high pt-4 px-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Showing page <strong className="text-on-surface">{pagination.page}</strong> of{' '}
            <strong className="text-on-surface">{pagination.pages}</strong> ({pagination.total} total items)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseItemsView;
