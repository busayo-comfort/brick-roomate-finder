import React, { useState, useRef, useEffect } from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { mockData } from '../data/mockData';

export type MoveInWindow = 'any' | '30' | '60' | '90' | 'later';
export type SortOption = 'compatibility' | 'budget-asc' | 'budget-desc' | 'movein-soonest' | 'name';

export interface FilterOptions {
  gender: 'all' | 'male' | 'female';
  location: string;
  minBudget: number;
  maxBudget: number;
  moveIn: MoveInWindow;
  sortBy: SortOption;
}

export const defaultFilters: FilterOptions = {
  gender: 'all',
  location: '',
  minBudget: 150000,
  maxBudget: 350000,
  moveIn: 'any',
  sortBy: 'compatibility',
};

const moveInOptions: { value: MoveInWindow; label: string }[] = [
  { value: 'any', label: 'Anytime' },
  { value: '30', label: 'Within 30 days' },
  { value: '60', label: 'Within 2 months' },
  { value: '90', label: 'Within 3 months' },
  { value: 'later', label: 'More than 3 months away' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'compatibility', label: 'Best match' },
  { value: 'budget-asc', label: 'Budget: low to high' },
  { value: 'budget-desc', label: 'Budget: high to low' },
  { value: 'movein-soonest', label: 'Move-in: soonest first' },
  { value: 'name', label: 'Name (A-Z)' },
];

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 'var(--spacing-md)',
  fontWeight: 600,
  fontSize: '0.95rem',
};

const controlStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--spacing-sm) var(--spacing-md)',
  border: '1px solid var(--light-gray)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  backgroundColor: 'var(--white)',
  color: 'var(--dark)',
};

interface RoommateFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const RoommateFilters: React.FC<RoommateFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  /** Push a partial change into state and notify the page in one go. */
  const apply = (patch: Partial<FilterOptions>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange(next);
  };

  // Universities and their areas double as location suggestions.
  const allLocations = mockData.universities
    .flatMap((uni) => [uni.name, ...uni.areas])
    .filter((loc, idx, arr) => arr.indexOf(loc) === idx);

  const filteredLocations = locationInput.trim()
    ? allLocations.filter((loc) => loc.toLowerCase().includes(locationInput.toLowerCase()))
    : [];

  const handleLocationSelect = (location: string) => {
    setLocationInput(location);
    setShowLocationDropdown(false);
    apply({ location });
  };

  const handleClearLocation = () => {
    setLocationInput('');
    apply({ location: '' });
  };

  const handleReset = () => {
    setLocationInput('');
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-2xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--light-gray)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Filter Roommates</h2>
        <button
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            background: 'none',
            border: '1px solid var(--light-gray)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            cursor: 'pointer',
            color: 'var(--gray)',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}
      >
        {/* Gender Filter */}
        <div>
          <label style={labelStyle}>Gender Preference</label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {(['all', 'male', 'female'] as const).map((option) => (
              <button
                key={option}
                onClick={() => apply({ gender: option })}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-md)',
                  border:
                    filters.gender === option
                      ? '2px solid var(--primary)'
                      : '1px solid var(--light-gray)',
                  backgroundColor:
                    filters.gender === option ? 'rgba(11, 64, 130, 0.1)' : 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: filters.gender === option ? 600 : 400,
                  color: filters.gender === option ? 'var(--primary)' : 'var(--gray)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                {option === 'all' ? 'Any' : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Location Filter with Autocomplete */}
        <div ref={locationRef} style={{ position: 'relative' }}>
          <label style={labelStyle}>Location/University</label>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                border: '1px solid var(--light-gray)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--white)',
                cursor: 'text',
              }}
            >
              <Search size={18} color="var(--gray)" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationDropdown(true);
                  apply({ location: e.target.value });
                }}
                onFocus={() => setShowLocationDropdown(true)}
                placeholder="Search university or area..."
                style={{
                  border: 'none',
                  flex: 1,
                  outline: 'none',
                  fontSize: '0.95rem',
                  backgroundColor: 'transparent',
                }}
              />
              {locationInput && (
                <button
                  onClick={handleClearLocation}
                  aria-label="Clear location"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={18} color="var(--gray)" />
                </button>
              )}
            </div>

            {showLocationDropdown && filteredLocations.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 'var(--spacing-sm)',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--light-gray)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 10,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {filteredLocations.map((location, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLocationSelect(location)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: 'none',
                      backgroundColor: 'var(--white)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom:
                        idx < filteredLocations.length - 1 ? '1px solid var(--very-light)' : 'none',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--very-light)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--white)';
                    }}
                  >
                    <div style={{ fontWeight: 500, color: 'var(--dark)' }}>{location}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Budget Range Filter */}
        <div>
          <label style={labelStyle}>Budget Range (₦/year)</label>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                min="100000"
                max="400000"
                step="10000"
                value={filters.minBudget}
                onChange={(e) => apply({ minBudget: parseInt(e.target.value) || 0 })}
                style={controlStyle}
              />
              <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.8rem', color: 'var(--gray)' }}>
                Min: ₦{filters.minBudget.toLocaleString()}
              </p>
            </div>
            <span style={{ color: 'var(--gray)', fontWeight: 600 }}>-</span>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                min="100000"
                max="400000"
                step="10000"
                value={filters.maxBudget}
                onChange={(e) => apply({ maxBudget: parseInt(e.target.value) || 0 })}
                style={controlStyle}
              />
              <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.8rem', color: 'var(--gray)' }}>
                Max: ₦{filters.maxBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Move-in Timeframe */}
        <div>
          <label style={labelStyle} htmlFor="movein-filter">
            Move-in Timeframe
          </label>
          <select
            id="movein-filter"
            value={filters.moveIn}
            onChange={(e) => apply({ moveIn: e.target.value as MoveInWindow })}
            style={controlStyle}
          >
            {moveInOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label style={labelStyle} htmlFor="sort-filter">
            Sort By
          </label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={(e) => apply({ sortBy: e.target.value as SortOption })}
            style={controlStyle}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RoommateFilters;
