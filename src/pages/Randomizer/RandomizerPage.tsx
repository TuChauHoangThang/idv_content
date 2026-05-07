import React, { useState, useRef } from 'react';
import { survivors, type Character } from '../../data/characters';
import { WheelCanvas, type WheelCanvasRef } from '../../components/Wheel/WheelCanvas';
import type { WheelItem } from '../../components/Wheel/WheelCanvas';
import './RandomizerPage.css';
import { RefreshCw, Users, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const defaultBranches = [
  'Nhánh 3-6',
  'Nhánh 9-12',
  'Nhánh 3-12',
  'Nhánh 6-12',
  'Nhánh 6-9',
  'Chỉ nhánh 9',
  'Chỉ nhánh 12',
  'Nhánh bông tuyết ❄️',
  'Không có nhánh, đừng có hỏi 🚫',
];

const defaultMissions = [
  'Không được giải mã',
  'Phải rescue đầu tiên',
  'Không được dùng item',
  'Emote khi gặp Hunter',
  'Chỉ được đi bộ, không chạy',
  'Phải giải mã sát cổng',
  'Chơi bằng 1 tay',
  'Không được nhìn minimap',
  'Phải kéo Hunter ít nhất 60s',
  'Phải emote sau khi vượt bảng',
];

const RandomizerPage: React.FC = () => {
  const [selectedSurvivors, setSelectedSurvivors] = useState<Character[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [branchResults, setBranchResults] = useState<string[]>([]);
  const [branchText, setBranchText] = useState(defaultBranches.join('\n'));

  // Mission now returns 4 results (one per player)
  const [missionResults, setMissionResults] = useState<string[]>([]);
  const [latestMission, setLatestMission] = useState<string | null>(null);
  const [missionText, setMissionText] = useState(defaultMissions.join('\n'));
  const [showMissionBanner, setShowMissionBanner] = useState(false);

  // Refs for programmatic spinning
  const branchWheelRef = useRef<WheelCanvasRef>(null);
  const missionWheelRef = useRef<WheelCanvasRef>(null);

  // Auto spin state using refs to avoid stale closures in callbacks
  const autoSpinCount = useRef(0);
  const autoMissionSpinCount = useRef(0);
  const isMegaRolling = useRef(false);

  const [isRollingUI, setIsRollingUI] = useState(false);
  const [isBranchSpinning, setIsBranchSpinning] = useState(false);
  const [isMissionSpinning, setIsMissionSpinning] = useState(false);

  const getRandomItems = (arr: Character[], count: number): Character[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const rollSurvivors = () => {
    setSelectedSurvivors(getRandomItems(survivors, 4));
    setBranchResults([]);
    setMissionResults([]);
    setLatestMission(null);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#d4a373', '#e0e6ed', '#2a9d8f'],
    });
  };

  const refreshSurvivor = (index: number) => {
    if (selectedSurvivors.length === 0) return;
    const newSurvivors = [...selectedSurvivors];
    let newChar: Character;
    do {
      newChar = getRandomItems(survivors, 1)[0];
    } while (newSurvivors.find((s) => s.id === newChar.id));
    newSurvivors[index] = newChar;
    setSelectedSurvivors(newSurvivors);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const shuffleBranchText = () => {
    const lines = branchText.split('\n').filter((line) => line.trim() !== '');
    const shuffled = [...lines].sort(() => 0.5 - Math.random());
    setBranchText(shuffled.join('\n'));
  };

  const shuffleMissionText = () => {
    const lines = missionText.split('\n').filter((line) => line.trim() !== '');
    const shuffled = [...lines].sort(() => 0.5 - Math.random());
    setMissionText(shuffled.join('\n'));
  };

  const branchLines = branchText.split('\n').filter((line) => line.trim() !== '');
  const branchItems: WheelItem[] = branchLines.map((line, index) => ({
    id: `branch-${index}`,
    name: line.trim(),
  }));

  const missionLines = missionText.split('\n').filter((line) => line.trim() !== '');
  const missionItems: WheelItem[] = missionLines.map((line, index) => ({
    id: `mission-${index}`,
    name: line.trim(),
  }));

  const handleBranchWin = (winner: WheelItem) => {
    setBranchResults((prev) => {
      if (prev.length >= 4) return prev;
      const newResults = [...prev, winner.name];

      if (autoSpinCount.current > 0 && newResults.length < 4) {
        setTimeout(() => {
          branchWheelRef.current?.spin(2000);
        }, 500);
      } else if (newResults.length === 4) {
        autoSpinCount.current = 0;
        setIsBranchSpinning(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e9c46a', '#2a9d8f'],
        });

        // If mega roll: trigger mission auto-spin 4x
        if (isMegaRolling.current) {
          setTimeout(() => {
            setIsMissionSpinning(true);
            setMissionResults([]);
            autoMissionSpinCount.current = 4;
            missionWheelRef.current?.spin(2000);
          }, 1000);
        }
      }
      return newResults;
    });
  };

  const handleMissionWin = (winner: WheelItem) => {
    setMissionResults((prev) => {
      if (prev.length >= 4) return prev;
      const newResults = [...prev, winner.name];

      setLatestMission(winner.name);
      setShowMissionBanner(true);
      setTimeout(() => setShowMissionBanner(false), 2500);

      if (autoMissionSpinCount.current > 0 && newResults.length < 4) {
        setTimeout(() => {
          missionWheelRef.current?.spin(2000);
        }, 500);
      } else if (newResults.length === 4) {
        autoMissionSpinCount.current = 0;
        setIsMissionSpinning(false);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#e63946', '#f4a261', '#e9c46a'],
        });

        if (isMegaRolling.current) {
          isMegaRolling.current = false;
          setIsRollingUI(false);
        }
      }
      return newResults;
    });
  };

  const triggerBranchAutoSpin = () => {
    if (isBranchSpinning || isRollingUI) return;
    setIsBranchSpinning(true);
    setBranchResults([]);
    autoSpinCount.current = 4;
    branchWheelRef.current?.spin(2000);
  };

  const triggerMissionAutoSpin = () => {
    if (isMissionSpinning || isRollingUI) return;
    setIsMissionSpinning(true);
    setMissionResults([]);
    autoMissionSpinCount.current = 4;
    missionWheelRef.current?.spin(2000);
  };

  const handleMegaRoll = () => {
    if (isMegaRolling.current || isBranchSpinning || isRollingUI) return;

    isMegaRolling.current = true;
    setIsRollingUI(true);
    setIsBranchSpinning(true);

    setSelectedSurvivors(getRandomItems(survivors, 4));
    setBranchResults([]);
    setMissionResults([]);
    setLatestMission(null);

    setTimeout(() => {
      autoSpinCount.current = 4;
      branchWheelRef.current?.spin(2000);
    }, 800);
  };

  const renderCharacterCard = (char: Character | null, index: number) => {
    if (!char) {
      return (
        <motion.div
          key={`empty-${index}`}
          className="character-card empty"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="char-placeholder">?</div>
        </motion.div>
      );
    }

    const branch = branchResults[index];
    const mission = missionResults[index];

    return (
      <motion.div
        key={char.id}
        className="character-card"
        initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20, delay: index * 0.15 }}
        whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.4)', borderColor: 'var(--accent-color)' }}
      >
        <div className="player-input-wrapper">
          <input
            type="text"
            className="player-name-input"
            placeholder={`Player ${index + 1}`}
            value={playerNames[index]}
            onChange={(e) => updatePlayerName(index, e.target.value)}
          />
        </div>

        <div className="char-image-placeholder">
          {char.image ? (
            <img src={char.image} alt={char.name} className="char-image" />
          ) : (
            <div className="char-role-icon">
              <Users size={32} />
            </div>
          )}
        </div>
        <div className="char-name">{char.name}</div>

        {/* Branch result */}
        <AnimatePresence>
          {branch && (
            <motion.div
              className="assigned-branch"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Target size={14} /> {branch}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission result */}
        <AnimatePresence>
          {mission && (
            <motion.div
              className="assigned-mission"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <Sparkles size={14} /> {mission}
            </motion.div>
          )}
        </AnimatePresence>

        <button className="btn-icon refresh-btn" onClick={() => refreshSurvivor(index)} title="Refresh this character">
          <RefreshCw size={18} />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="randomizer-container">
      {/* Mega Roll Button */}
      <div className="mega-roll-container">
        <button
          className={`btn btn-mega ${isRollingUI ? 'disabled' : ''}`}
          onClick={handleMegaRoll}
          disabled={isRollingUI}
        >
          <Zap size={24} /> NÀO MÌNH CÙNG CONTENT NHA (ROLL)
        </button>
        <p className="mega-desc">Tự động chọn 4 Survivor + 4 Nhánh kỹ năng + 4 Nhiệm vụ riêng</p>
      </div>

      {/* Survivor Randomizer */}
      <div className="section survivors-section">
        <div className="section-header">
          <h2>
            <Users size={24} /> Survivors (4 Players)
          </h2>
          <button className="btn btn-primary" onClick={rollSurvivors}>
            <RefreshCw size={20} /> Roll Survivors
          </button>
        </div>
        <motion.div className="cards-grid" layout>
          <AnimatePresence mode="popLayout">
            {selectedSurvivors.length > 0
              ? selectedSurvivors.map((char, i) => renderCharacterCard(char, i))
              : Array(4)
                  .fill(null)
                  .map((_, i) => renderCharacterCard(null, i))}
          </AnimatePresence>
        </motion.div>

        {/* Team Mission Display - shows all 4 mission results */}
        <AnimatePresence>
          {missionResults.length > 0 && (
            <motion.div
              className="team-mission-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
            >
              <h3>
                <Sparkles size={20} /> Nhiệm vụ ({missionResults.length}/4)
              </h3>
              <div className="mission-results-grid">
                {missionResults.map((m, idx) => (
                  <motion.div
                    key={`team-mission-${idx}`}
                    className="mission-result-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: idx * 0.08 }}
                  >
                    <span className="player-badge mission-badge">P{idx + 1}</span>
                    <span className="mission-text">{m}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spin Wheels Section */}
      <div className="wheels-section">
        {/* Branch Wheel */}
        <div className="section wheel-card">
          <div className="section-header">
            <h2>
              <Target size={24} /> Vòng Quay Nhánh
            </h2>
          </div>
          <p className="wheel-description">Random nhánh kỹ năng cho 4 Survivor!</p>

          <button
            className="btn btn-secondary spin-4-btn"
            onClick={triggerBranchAutoSpin}
            disabled={isBranchSpinning || isRollingUI}
          >
            <RefreshCw size={18} /> Tự quay 4 lần
          </button>

          <div className="wheel-wrapper">
            <WheelCanvas ref={branchWheelRef} items={branchItems} onSpinEnd={handleBranchWin} size={360} />
          </div>

          <div className="branch-results-list">
            <h4>Kết quả Nhánh ({branchResults.length}/4)</h4>
            <ul>
              <AnimatePresence>
                {branchResults.map((res, idx) => (
                  <motion.li key={`branch-${res}-${idx}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <span className="player-badge">P{idx + 1}</span> {res}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="mission-editor" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>📝 Chỉnh sửa nhánh (mỗi dòng 1 nhánh)</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={shuffleBranchText} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🔀 Trộn</button>
                <button className="btn-icon" onClick={() => setBranchText('')} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🗑️ Xóa hết</button>
              </div>
            </div>
            <textarea className="input-field mission-textarea" value={branchText} onChange={(e) => setBranchText(e.target.value)} placeholder="Nhập nhánh, mỗi dòng 1 nhánh..." rows={6} />
          </div>
        </div>

        {/* Mission Wheel */}
        <div className="section wheel-card">
          <div className="section-header">
            <h2>
              <Sparkles size={24} /> Vòng Quay Nhiệm Vụ
            </h2>
          </div>
          <p className="wheel-description">Nhiệm vụ riêng cho từng người chơi! 🎯</p>

          <button
            className="btn btn-secondary spin-4-btn mission-spin-btn"
            onClick={triggerMissionAutoSpin}
            disabled={isMissionSpinning || isRollingUI}
          >
            <RefreshCw size={18} /> Tự quay 4 lần
          </button>

          <AnimatePresence>
            {showMissionBanner && latestMission && (
              <motion.div
                className="wheel-winner-banner mission-winner"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <Trophy size={24} color="#e9c46a" />
                <span>{latestMission}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="wheel-wrapper">
            <WheelCanvas ref={missionWheelRef} items={missionItems} onSpinEnd={handleMissionWin} size={360} />
          </div>

          {/* Mission Results List */}
          <div className="branch-results-list mission-results-list">
            <h4>Kết quả Nhiệm vụ ({missionResults.length}/4)</h4>
            <ul>
              <AnimatePresence>
                {missionResults.map((res, idx) => (
                  <motion.li
                    key={`mission-${res}-${idx}`}
                    className="mission-result-li"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="player-badge mission-badge">P{idx + 1}</span> {res}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="mission-editor">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>📝 Chỉnh sửa nhiệm vụ (mỗi dòng 1 nhiệm vụ)</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={shuffleMissionText} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🔀 Trộn</button>
                <button className="btn-icon" onClick={() => setMissionText('')} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🗑️ Xóa hết</button>
              </div>
            </div>
            <textarea className="input-field mission-textarea" value={missionText} onChange={(e) => setMissionText(e.target.value)} placeholder="Nhập nhiệm vụ, mỗi dòng 1 nhiệm vụ..." rows={6} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomizerPage;
