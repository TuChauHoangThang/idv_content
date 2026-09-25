import React, { useState, useRef } from 'react';
import { hunters, type Character } from '../../data/characters';
import { defaultHunterTraits, defaultHunterBranches, defaultHunterMissions } from '../../data/hunter-data';
import { WheelCanvas, type WheelCanvasRef, type WheelItem } from '../../components/Wheel/WheelCanvas';
import './HunterRandomizerPage.css';
import { RefreshCw, Zap, ShieldAlert, Target, Sparkles, Skull, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const HunterRandomizerPage: React.FC = () => {
  const [hunterCountMode, setHunterCountMode] = useState<1 | 2>(1); // 1 Hunter or 2 Hunters (Duo mode)
  const [selectedHunters, setSelectedHunters] = useState<Character[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>(['Hunter 1', 'Hunter 2']);

  // Results for Trait (Bổ trợ), Branch (Nhánh Talent), and Mission
  const [traitResults, setTraitResults] = useState<string[]>([]);
  const [branchResults, setBranchResults] = useState<string[]>([]);
  const [missionResults, setMissionResults] = useState<string[]>([]);

  const [traitText, setTraitText] = useState(defaultHunterTraits.join('\n'));
  const [branchText, setBranchText] = useState(defaultHunterBranches.join('\n'));
  const [missionText, setMissionText] = useState(defaultHunterMissions.join('\n'));

  const [latestMission, setLatestMission] = useState<string | null>(null);
  const [showMissionBanner, setShowMissionBanner] = useState(false);

  // Wheel refs for auto spinning
  const traitWheelRef = useRef<WheelCanvasRef>(null);
  const branchWheelRef = useRef<WheelCanvasRef>(null);
  const missionWheelRef = useRef<WheelCanvasRef>(null);

  // Auto spin counters
  const autoTraitSpinCount = useRef(0);
  const autoBranchSpinCount = useRef(0);
  const autoMissionSpinCount = useRef(0);
  const isMegaRolling = useRef(false);

  const [isRollingUI, setIsRollingUI] = useState(false);
  const [isTraitSpinning, setIsTraitSpinning] = useState(false);
  const [isBranchSpinning, setIsBranchSpinning] = useState(false);
  const [isMissionSpinning, setIsMissionSpinning] = useState(false);

  const getRandomItems = (arr: Character[], count: number): Character[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const rollHunters = () => {
    setSelectedHunters(getRandomItems(hunters, hunterCountMode));
    setTraitResults([]);
    setBranchResults([]);
    setMissionResults([]);
    setLatestMission(null);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#e63946', '#8b0000', '#ffc107'],
    });
  };

  const refreshSingleHunter = (index: number) => {
    if (selectedHunters.length === 0) return;
    const newHunters = [...selectedHunters];
    let newChar: Character;
    do {
      newChar = getRandomItems(hunters, 1)[0];
    } while (newHunters.find((h) => h.id === newChar.id));
    newHunters[index] = newChar;
    setSelectedHunters(newHunters);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  // Convert text input into WheelItems
  const traitLines = traitText.split('\n').filter((l) => l.trim() !== '');
  const traitItems: WheelItem[] = traitLines.map((l, i) => ({ id: `trait-${i}`, name: l.trim() }));

  const branchLines = branchText.split('\n').filter((l) => l.trim() !== '');
  const branchItems: WheelItem[] = branchLines.map((l, i) => ({ id: `branch-${i}`, name: l.trim() }));

  const missionLines = missionText.split('\n').filter((l) => l.trim() !== '');
  const missionItems: WheelItem[] = missionLines.map((l, i) => ({ id: `mission-${i}`, name: l.trim() }));

  // Wheel Spin Handlers
  const handleTraitWin = (winner: WheelItem) => {
    setTraitResults((prev) => {
      if (prev.length >= hunterCountMode) return prev;
      const newResults = [...prev, winner.name];

      if (autoTraitSpinCount.current > 0 && newResults.length < hunterCountMode) {
        setTimeout(() => {
          traitWheelRef.current?.spin(2000);
        }, 500);
      } else if (newResults.length === hunterCountMode) {
        autoTraitSpinCount.current = 0;
        setIsTraitSpinning(false);

        // If mega roll in progress, trigger Branch wheel
        if (isMegaRolling.current) {
          setTimeout(() => {
            setIsBranchSpinning(true);
            setBranchResults([]);
            autoBranchSpinCount.current = hunterCountMode;
            branchWheelRef.current?.spin(2000);
          }, 800);
        }
      }
      return newResults;
    });
  };

  const handleBranchWin = (winner: WheelItem) => {
    setBranchResults((prev) => {
      if (prev.length >= hunterCountMode) return prev;
      const newResults = [...prev, winner.name];

      if (autoBranchSpinCount.current > 0 && newResults.length < hunterCountMode) {
        setTimeout(() => {
          branchWheelRef.current?.spin(2000);
        }, 500);
      } else if (newResults.length === hunterCountMode) {
        autoBranchSpinCount.current = 0;
        setIsBranchSpinning(false);

        // If mega roll in progress, trigger Mission wheel
        if (isMegaRolling.current) {
          setTimeout(() => {
            setIsMissionSpinning(true);
            setMissionResults([]);
            autoMissionSpinCount.current = hunterCountMode;
            missionWheelRef.current?.spin(2000);
          }, 800);
        }
      }
      return newResults;
    });
  };

  const handleMissionWin = (winner: WheelItem) => {
    setMissionResults((prev) => {
      if (prev.length >= hunterCountMode) return prev;
      const newResults = [...prev, winner.name];

      setLatestMission(winner.name);
      setShowMissionBanner(true);
      setTimeout(() => setShowMissionBanner(false), 2500);

      if (autoMissionSpinCount.current > 0 && newResults.length < hunterCountMode) {
        setTimeout(() => {
          missionWheelRef.current?.spin(2000);
        }, 500);
      } else if (newResults.length === hunterCountMode) {
        autoMissionSpinCount.current = 0;
        setIsMissionSpinning(false);

        confetti({
          particleCount: 180,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#e63946', '#ffc107', '#8b0000'],
        });

        if (isMegaRolling.current) {
          isMegaRolling.current = false;
          setIsRollingUI(false);
        }
      }
      return newResults;
    });
  };

  // Auto Spin Triggers
  const triggerTraitAutoSpin = () => {
    if (isTraitSpinning || isRollingUI) return;
    setIsTraitSpinning(true);
    setTraitResults([]);
    autoTraitSpinCount.current = hunterCountMode;
    traitWheelRef.current?.spin(2000);
  };

  const triggerBranchAutoSpin = () => {
    if (isBranchSpinning || isRollingUI) return;
    setIsBranchSpinning(true);
    setBranchResults([]);
    autoBranchSpinCount.current = hunterCountMode;
    branchWheelRef.current?.spin(2000);
  };

  const triggerMissionAutoSpin = () => {
    if (isMissionSpinning || isRollingUI) return;
    setIsMissionSpinning(true);
    setMissionResults([]);
    autoMissionSpinCount.current = hunterCountMode;
    missionWheelRef.current?.spin(2000);
  };

  // Mega Roll Hunter
  const handleMegaRollHunter = () => {
    if (isMegaRolling.current || isRollingUI) return;

    isMegaRolling.current = true;
    setIsRollingUI(true);

    // 1. Roll Hunters
    setSelectedHunters(getRandomItems(hunters, hunterCountMode));
    setTraitResults([]);
    setBranchResults([]);
    setMissionResults([]);
    setLatestMission(null);

    // 2. Start Trait wheel after short delay
    setTimeout(() => {
      setIsTraitSpinning(true);
      autoTraitSpinCount.current = hunterCountMode;
      traitWheelRef.current?.spin(2000);
    }, 800);
  };

  // Helper shuffle text
  const shuffleText = (text: string, setter: (val: string) => void) => {
    const lines = text.split('\n').filter((l) => l.trim() !== '');
    const shuffled = [...lines].sort(() => 0.5 - Math.random());
    setter(shuffled.join('\n'));
  };

  const renderHunterCard = (char: Character | null, index: number) => {
    if (!char) {
      return (
        <motion.div
          key={`empty-hunter-${index}`}
          className="hunter-card empty"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="char-placeholder">?</div>
          <div className="char-name" style={{ color: '#a0abbc' }}>Bấm Roll Hunter</div>
        </motion.div>
      );
    }

    const trait = traitResults[index];
    const branch = branchResults[index];
    const mission = missionResults[index];

    return (
      <motion.div
        key={char.id}
        className="hunter-card"
        initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20, delay: index * 0.15 }}
      >
        <div className="player-input-wrapper">
          <input
            type="text"
            className="player-name-input"
            placeholder={`Hunter ${index + 1}`}
            value={playerNames[index]}
            onChange={(e) => updatePlayerName(index, e.target.value)}
          />
        </div>

        <div className="hunter-image-placeholder">
          {char.image ? (
            <img src={char.image} alt={char.name} className="hunter-image" />
          ) : (
            <Skull size={48} color="#e63946" />
          )}
        </div>

        <div className="hunter-name">{char.name}</div>

        {/* Trait Result */}
        <AnimatePresence>
          {trait && (
            <motion.div
              className="assigned-trait"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <ShieldAlert size={14} /> {trait}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Branch Result */}
        <AnimatePresence>
          {branch && (
            <motion.div
              className="assigned-hunter-branch"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <Target size={14} /> {branch}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission Result */}
        <AnimatePresence>
          {mission && (
            <motion.div
              className="assigned-hunter-mission"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Sparkles size={14} /> {mission}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="btn-icon refresh-btn"
          onClick={() => refreshSingleHunter(index)}
          title="Đổi Hunter này"
          style={{ marginTop: '0.8rem' }}
        >
          <RefreshCw size={18} />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="randomizer-container hunter-randomizer-container hunter-theme">
      {/* Mode Selector: 1v4 Single vs 2v8 Duo Hunter */}
      <div className="mode-selector-container">
        <button
          className={`mode-btn ${hunterCountMode === 1 ? 'active' : ''}`}
          onClick={() => {
            setHunterCountMode(1);
            setSelectedHunters([]);
            setTraitResults([]);
            setBranchResults([]);
            setMissionResults([]);
          }}
        >
          <Skull size={18} /> Trận Đơn (1 Hunter)
        </button>

        <button
          className={`mode-btn ${hunterCountMode === 2 ? 'active' : ''}`}
          onClick={() => {
            setHunterCountMode(2);
            setSelectedHunters([]);
            setTraitResults([]);
            setBranchResults([]);
            setMissionResults([]);
          }}
        >
          <Users size={18} /> Chế Độ 2v8 (2 Hunters)
        </button>
      </div>

      {/* Mega Roll Hunter Button */}
      <div className="mega-roll-container">
        <button
          className={`btn btn-mega mega-roll-hunter ${isRollingUI ? 'disabled' : ''}`}
          onClick={handleMegaRollHunter}
          disabled={isRollingUI}
        >
          <Zap size={26} /> NÀO MÌNH CÙNG HUNT NHA (ROLL HUNTER)
        </button>
        <p className="mega-desc" style={{ color: '#ff9999' }}>
          Tự động roll {hunterCountMode} Hunter + Bổ trợ + Nhánh kỹ năng + Nhiệm vụ Hunter!
        </p>
      </div>

      {/* Hunter Display Section */}
      <div className="section survivors-section" style={{ borderColor: 'rgba(230, 57, 70, 0.4)' }}>
        <div className="section-header">
          <h2 style={{ color: '#ffc107' }}>
            <Skull size={26} color="#e63946" /> Hunter {hunterCountMode === 2 ? '(2 Hunters)' : ''}
          </h2>
          <button className="btn btn-primary" onClick={rollHunters} style={{ background: 'linear-gradient(135deg, #8b0000, #e63946)', borderColor: '#ff4d4d' }}>
            <RefreshCw size={20} /> Roll Hunter
          </button>
        </div>

        <motion.div className="hunter-cards-grid" layout>
          <AnimatePresence mode="popLayout">
            {selectedHunters.length > 0
              ? selectedHunters.map((char, i) => renderHunterCard(char, i))
              : Array(hunterCountMode)
                  .fill(null)
                  .map((_, i) => renderHunterCard(null, i))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Three Hunter Wheels Section */}
      <div className="hunter-wheels-grid">
        {/* Trait Wheel (Bổ trợ) */}
        <div className="section wheel-card hunter-wheel-card">
          <div className="section-header">
            <h2 style={{ color: '#ff9999' }}>
              <ShieldAlert size={22} color="#e63946" /> Vòng Quay Bổ Trợ
            </h2>
          </div>
          <p className="wheel-description">Random Bổ trợ (Blink, Teleport, Patroller...)</p>

          <button
            className="btn btn-secondary spin-4-btn"
            onClick={triggerTraitAutoSpin}
            disabled={isTraitSpinning || isRollingUI}
            style={{ background: '#8b0000' }}
          >
            <RefreshCw size={18} /> Tự quay {hunterCountMode} lần
          </button>

          <div className="wheel-wrapper">
            <WheelCanvas ref={traitWheelRef} items={traitItems} onSpinEnd={handleTraitWin} size={340} />
          </div>

          <div className="branch-results-list">
            <h4>Kết quả Bổ Trợ ({traitResults.length}/{hunterCountMode})</h4>
            <ul>
              <AnimatePresence>
                {traitResults.map((res, idx) => (
                  <motion.li key={`trait-res-${idx}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <span className="player-badge hunter-badge">H{idx + 1}</span> {res}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="mission-editor" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>📝 Chỉnh sửa Bổ Trợ</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={() => shuffleText(traitText, setTraitText)} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🔀 Trộn</button>
                <button className="btn-icon" onClick={() => setTraitText('')} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🗑️ Xóa</button>
              </div>
            </div>
            <textarea className="input-field mission-textarea" value={traitText} onChange={(e) => setTraitText(e.target.value)} rows={5} />
          </div>
        </div>

        {/* Branch Wheel (Nhánh Talent) */}
        <div className="section wheel-card hunter-wheel-card">
          <div className="section-header">
            <h2 style={{ color: '#ffe082' }}>
              <Target size={22} color="#ffc107" /> Vòng Quay Nhánh Talent
            </h2>
          </div>
          <p className="wheel-description">Random nhánh 12, 6, 3, 9 cho Hunter!</p>

          <button
            className="btn btn-secondary spin-4-btn"
            onClick={triggerBranchAutoSpin}
            disabled={isBranchSpinning || isRollingUI}
            style={{ background: '#8b0000' }}
          >
            <RefreshCw size={18} /> Tự quay {hunterCountMode} lần
          </button>

          <div className="wheel-wrapper">
            <WheelCanvas ref={branchWheelRef} items={branchItems} onSpinEnd={handleBranchWin} size={340} />
          </div>

          <div className="branch-results-list">
            <h4>Kết quả Nhánh ({branchResults.length}/{hunterCountMode})</h4>
            <ul>
              <AnimatePresence>
                {branchResults.map((res, idx) => (
                  <motion.li key={`branch-res-${idx}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <span className="player-badge hunter-badge">H{idx + 1}</span> {res}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="mission-editor" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>📝 Chỉnh sửa Nhánh Talent</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={() => shuffleText(branchText, setBranchText)} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🔀 Trộn</button>
                <button className="btn-icon" onClick={() => setBranchText('')} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🗑️ Xóa</button>
              </div>
            </div>
            <textarea className="input-field mission-textarea" value={branchText} onChange={(e) => setBranchText(e.target.value)} rows={5} />
          </div>
        </div>

        {/* Mission Wheel */}
        <div className="section wheel-card hunter-wheel-card">
          <div className="section-header">
            <h2 style={{ color: '#e0b0ff' }}>
              <Sparkles size={22} color="#8a2be2" /> Nhiệm Vụ Hunter
            </h2>
          </div>
          <p className="wheel-description">Thử thách độc lạ cho Hunter!</p>

          <button
            className="btn btn-secondary spin-4-btn"
            onClick={triggerMissionAutoSpin}
            disabled={isMissionSpinning || isRollingUI}
            style={{ background: '#8b0000' }}
          >
            <RefreshCw size={18} /> Tự quay {hunterCountMode} lần
          </button>

          <AnimatePresence>
            {showMissionBanner && latestMission && (
              <motion.div
                className="wheel-winner-banner mission-winner"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                style={{ background: 'rgba(230, 57, 70, 0.95)', border: '1px solid #ff4d4d' }}
              >
                <Trophy size={24} color="#ffc107" />
                <span>{latestMission}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="wheel-wrapper">
            <WheelCanvas ref={missionWheelRef} items={missionItems} onSpinEnd={handleMissionWin} size={340} />
          </div>

          <div className="branch-results-list">
            <h4>Kết quả Nhiệm vụ ({missionResults.length}/{hunterCountMode})</h4>
            <ul>
              <AnimatePresence>
                {missionResults.map((res, idx) => (
                  <motion.li key={`mission-res-${idx}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <span className="player-badge hunter-badge">H{idx + 1}</span> {res}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="mission-editor" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>📝 Chỉnh sửa Nhiệm vụ</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={() => shuffleText(missionText, setMissionText)} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🔀 Trộn</button>
                <button className="btn-icon" onClick={() => setMissionText('')} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>🗑️ Xóa</button>
              </div>
            </div>
            <textarea className="input-field mission-textarea" value={missionText} onChange={(e) => setMissionText(e.target.value)} rows={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HunterRandomizerPage;
