import React from 'react';

export const ItemFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  selectedCity,
  onCityChange,
  dateFilter,
  onDateFilterChange,
  onResetFilters
}) => {
  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || selectedCity || dateFilter
  );

  return (
    <div className="flex flex-col gap-space-md p-space-lg bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-center">
        {/* Search Input */}
        <div className="lg:col-span-5 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-space-md rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
            placeholder="Search by keyword, brand, color, serial number..."
            type="text"
          />
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-3 relative">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-11 pl-9 pr-8 appearance-none rounded-lg bg-surface-container-low font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer border border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              category
            </span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Campus Zone / City Filter */}
        <div className="lg:col-span-3 relative">
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full h-11 pl-9 pr-8 appearance-none rounded-lg bg-surface-container-low font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer border border-transparent"
            >
              <option value="">All Campus Zones & Hubs</option>
              <option value="Central Campus">Central Campus & Library</option>
              <option value="Engineering Hall">Engineering Complex</option>
              <option value="Science Block">Science & Research Quad</option>
              <option value="Sports Complex">Recreation & Athletic Center</option>
              <option value="Student Union">Student Union & Dining</option>
              <option value="Transit Station">Transit Terminal & Parking</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              location_on
            </span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Reset Filter Button */}
        <div className="lg:col-span-1 flex justify-end">
          <button
            onClick={onResetFilters}
            className="w-full lg:w-11 h-11 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
            title="Clear All Filters"
          >
            <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      {/* Active Tags Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-space-xs pt-space-xs border-t border-surface-container-low">
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium pr-space-xs">
            Active Filters:
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
              Keyword: "{searchQuery}"
              <span
                onClick={() => onSearchChange('')}
                className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
              >
                close
              </span>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
              Category: {categories.find((c) => c._id === selectedCategory)?.name || 'Selected'}
              <span
                onClick={() => onCategoryChange('')}
                className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
              >
                close
              </span>
            </span>
          )}

          {selectedCity && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
              Zone: {selectedCity}
              <span
                onClick={() => onCityChange('')}
                className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
              >
                close
              </span>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-primary hover:underline font-label-sm text-label-sm ml-space-xs font-semibold cursor-pointer"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemFilters;
