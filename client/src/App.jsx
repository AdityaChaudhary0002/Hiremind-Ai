import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import InterviewScreen from './pages/InterviewScreen';
import FeedbackScreen from './pages/FeedbackScreen';
import AuthLayout from './pages/AuthLayout';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import InterviewBreakdown from './pages/InterviewBreakdown';
import GoalsPage from './pages/GoalsPage';
import ResumeScanner from './pages/ResumeScanner';
import AppLayout from './layouts/AppLayout';
import PageTransition from './components/PageTransition';

import { ThemeProvider } from "@/components/theme-provider"

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PageTransition>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <LandingPage />
              </SignedOut>
            </PageTransition>
          }
        />
        <Route path="/login" element={<PageTransition><AuthLayout /></PageTransition>} />
        <Route path="/register" element={<PageTransition><AuthLayout /></PageTransition>} />

        {/* Protected Routes with Global Layout */}
        <Route
          element={
            <SignedIn>
              <AppLayout />
            </SignedIn>
          }
        >
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/role-selection" element={<PageTransition><RoleSelection /></PageTransition>} />
          <Route path="/history" element={<PageTransition><HistoryPage /></PageTransition>} />
          <Route path="/history/:interviewId" element={<PageTransition><InterviewBreakdown /></PageTransition>} />
          <Route path="/goals" element={<PageTransition><GoalsPage /></PageTransition>} />
          <Route path="/resume-scan" element={<PageTransition><ResumeScanner /></PageTransition>} />
          <Route path="/feedback/:interviewId" element={<PageTransition><FeedbackScreen /></PageTransition>} />
        </Route>

        {/* Interview Routes */}
        <Route
          path="/interview"
          element={
            <PageTransition>
              <SignedIn>
                <InterviewScreen />
              </SignedIn>
            </PageTransition>
          }
        />
        <Route
          path="/interview/:interviewId"
          element={
            <PageTransition>
              <SignedIn>
                <InterviewScreen />
              </SignedIn>
            </PageTransition>
          }
        />

        {/* Helper */}
        <Route path="*" element={
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        } />

      </Routes>
    </AnimatePresence>
  );
};

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Global Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">CRITICAL SYSTEM FAILURE</h1>
          <p className="text-white/60 mb-8 max-w-md">
            The neural link has encountered an unrecoverable error.
          </p>
          <pre className="bg-red-900/20 text-red-200 p-4 rounded text-left text-xs mb-8 overflow-auto max-w-2xl w-full border border-red-500/30">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
          >
            EMERGENCY RESET
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <AnimatedRoutes />
        </Router>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
