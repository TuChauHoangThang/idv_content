import React, { useState } from 'react';
import { WheelCanvas } from '../../components/Wheel/WheelCanvas';
import type { WheelItem } from '../../components/Wheel/WheelCanvas';
import { allCharacters } from '../../data/characters';
import './WheelPage.css';
import { Shuffle, SortAsc, Trash2, RotateCcw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const WheelPage: React.FC = () => {
  const [inputText, setInputText] = useState(
    allCharacters.map(c => c.name).join('\n')
  );
  const [results, setResults] = useState<string[]>([]);
  const [showWinner, setShowWinner] = useState<string | null>(null);

  const lines = inputText.split('\n').filter(line => line.trim() !== '');
  
  const wheelItems: WheelItem[] = lines.map((line, index) => {
    const name = line.trim();
    const matchedChar = allCharacters.find(c => c.name === name);
    return {
      id: matchedChar ? matchedChar.id : `custom-${index}`,
      name: name,
      image: matchedChar?.image
    };
  });

  const handleShuffle = () => {
    const shuffled = [...lines].sort(() => 0.5 - Math.random());
    setInputText(shuffled.join('\n'));
  };

  const handleSort = () => {
    const sorted = [...lines].sort((a, b) => a.localeCompare(b));
    setInputText(sorted.join('\n'));
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleSpinEnd = (winner: WheelItem) => {
    setResults(prev => [winner.name, ...prev]);
    setShowWinner(winner.name);
    
    // Confetti celebration
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e9c46a', '#e63946', '#457b9d']
    });

    // Hide winner banner after 4 seconds
    setTimeout(() => {
      setShowWinner(null);
    }, 4000);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="wheel-page">
      <AnimatePresence>
        {showWinner && (
          <motion.div 
            className="winner-banner"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <Trophy size={32} color="#e9c46a" />
            <div className="winner-text">
              <span>Winner!</span>
              <h2>{showWinner}</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="wheel-layout">
        <div className="wheel-section card">
          <WheelCanvas items={wheelItems} onSpinEnd={handleSpinEnd} />
        </div>

        <div className="controls-section card">
          <div className="tabs">
            <div className="tab active">Entries ({lines.length})</div>
            <div className="tab">Results ({results.length})</div>
          </div>

          <div className="toolbar">
            <button className="btn btn-secondary btn-sm" onClick={handleShuffle}>
              <Shuffle size={16} /> Shuffle
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleSort}>
              <SortAsc size={16} /> Sort
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleClear}>
              <Trash2 size={16} /> Clear
            </button>
          </div>

          <textarea
            className="entries-input input-field"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter names here, one per line..."
          />
        </div>

        <div className="results-section card">
          <div className="section-header-small">
            <h3>Recent Results</h3>
            <button className="btn-icon" onClick={clearResults} title="Clear Results">
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="results-list">
            <AnimatePresence>
              {results.length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="no-results"
                >
                  No results yet.
                </motion.p>
              ) : (
                results.map((r, i) => (
                  <motion.div 
                    key={`${r}-${results.length - i}`} 
                    className="result-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <span className="result-number">{results.length - i}.</span>
                    <span className="result-name">{r}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelPage;
