import React, { useState, useEffect, useRef } from 'react';
import { Location } from '../types';
import { searchLocation } from '../services/nominatim';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, selectedLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      const locations = await searchLocation(query);
      setResults(locations);
      setIsLoading(false);
      setShowDropdown(true);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSelect = (location: Location) => {
    onLocationSelect(location);
    setQuery(location.display_name);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Location
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for any location worldwide..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-11 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelect(location)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b last:border-b-0"
            >
              <p className="text-sm text-gray-800">{location.display_name}</p>
            </button>
          ))}
        </div>
      )}

      {selectedLocation && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Location selected: {selectedLocation.display_name}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
