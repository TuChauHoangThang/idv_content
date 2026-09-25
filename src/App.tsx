
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import RandomizerPage from './pages/Randomizer/RandomizerPage';
import HunterRandomizerPage from './pages/HunterRandomizer/HunterRandomizerPage';
import { AnimatePresence, motion } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<Navigate to="/survivor" replace />}
        />
        <Route
          path="/survivor"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RandomizerPage />
            </motion.div>
          }
        />
        <Route
          path="/hunter"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HunterRandomizerPage />
            </motion.div>
          }
        />
        <Route path="/wheel" element={<Navigate to="/survivor" replace />} />
        <Route path="*" element={<Navigate to="/survivor" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;

