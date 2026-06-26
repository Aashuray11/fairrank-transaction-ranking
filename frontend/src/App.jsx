import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Layout from "./components/Layout";
import AddTransactionPage from "./pages/AddTransactionPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import UserSummaryPage from "./pages/UserSummaryPage";

const pageAnimation = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28 },
};

export default function App() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div {...pageAnimation}>
                <DashboardPage />
              </motion.div>
            }
          />
          <Route
            path="/add-transaction"
            element={
              <motion.div {...pageAnimation}>
                <AddTransactionPage />
              </motion.div>
            }
          />
          <Route
            path="/user-summary"
            element={
              <motion.div {...pageAnimation}>
                <UserSummaryPage />
              </motion.div>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <motion.div {...pageAnimation}>
                <LeaderboardPage />
              </motion.div>
            }
          />
          <Route
            path="/analytics"
            element={
              <motion.div {...pageAnimation}>
                <AnalyticsPage />
              </motion.div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
