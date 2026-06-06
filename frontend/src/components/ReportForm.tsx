import React, { useState } from 'react';
import LocationSearch from './LocationSearch';
import { Location } from '../types';
import { submitReport } from '../services/api';

interface ReportFormProps {
  onSuccess: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const [text, setText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxChars = 5000;
  const minChars = 10;
  const charCount = text.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (charCount < minChars) {
      setError(`Please enter at least ${minChars} characters.`);
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReport({
        text,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      });

      setSuccess(true);
      setText('');
      setSelectedLocation(null);
      
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Report an Incident</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-pulse">
          ✓ Report submitted successfully! Your contribution helps keep the community safe.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incident Description
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what happened... (any language supported)"
            rows={6}
            maxLength={maxChars}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
            disabled={isSubmitting || success}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${charCount < minChars ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount < minChars ? `${minChars - charCount} more characters needed` : ''}
            </span>
            <span className={`text-sm ${charCount > maxChars * 0.9 ? 'text-warning-600' : 'text-gray-500'}`}>
              {charCount} / {maxChars}
            </span>
          </div>
        </div>

        <LocationSearch
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
        />

        <button
          type="submit"
          disabled={isSubmitting || success || charCount < minChars || !selectedLocation}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : success ? (
            '✓ Submitted'
          ) : (
            'Submit Report Anonymously'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your report is completely anonymous. Location will be fuzzed for privacy.
        </p>
      </form>
    </div>
  );
};

export default ReportForm;
