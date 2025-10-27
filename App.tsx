import React, { useState } from 'react';
import type { StartupName } from './types';
import { generateStartupNames } from './services/geminiService';
import Loader from './components/Loader';
import SparklesIcon from './components/icons/SparklesIcon';
import LightbulbIcon from './components/icons/LightbulbIcon';

const App: React.FC = () => {
  const [industry, setIndustry] = useState<string>('');
  const [names, setNames] = useState<StartupName[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!industry.trim()) {
      setError('Please enter an industry.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setNames([]);

    try {
      const generatedNames = await generateStartupNames(industry);
      setNames(generatedNames);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon className="w-8 h-8 text-lime-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-lime-400">
              Startup Name Generator
            </h1>
          </div>
          <p className="text-lg text-gray-400">
            Fuel your next big idea with AI-powered creativity.
          </p>
        </header>

        {/* Form */}
        <div className="sticky top-4 bg-gray-950/80 backdrop-blur-sm z-10 py-4 rounded-lg">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Sustainable Fashion, AI, Fintech"
                className="flex-grow bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition duration-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center bg-lime-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200"
              >
                <LightbulbIcon className="w-5 h-5 mr-2" />
                {isLoading ? 'Generating...' : 'Generate Names'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Results */}
        <main className="mt-4">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          {isLoading && <Loader />}
          
          {!isLoading && names.length === 0 && !error && (
            <div className="text-center text-gray-500 py-10">
              <p className="text-xl">Your creative names will appear here.</p>
              <p>Enter an industry above to get started!</p>
            </div>
          )}

          {names.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {names.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 p-5 rounded-lg border border-gray-700 transform hover:scale-105 hover:border-lime-500 transition-all duration-300 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-lime-400">{item.name}</h3>
                  <p className="text-gray-400 mt-1 italic">"{item.tagline}"</p>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-600 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;