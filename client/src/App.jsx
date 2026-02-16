import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import InterviewScreen from './pages/InterviewScreen';
import FeedbackScreen from './pages/FeedbackScreen';
import AuthLayout from './pages/AuthLayout';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import GoalsPage from './pages/GoalsPage';

import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <LandingPage />
                </SignedOut>
              </>
            }
          />
          <Route path="/login" element={<AuthLayout />} />
          <Route path="/register" element={<AuthLayout />} />
          <Route
            path="/role-selection"
            element={
              <>
                <SignedIn>
                  <RoleSelection />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/interview"
            element={
              <>
                <SignedIn>
                  <InterviewScreen />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/feedback/:interviewId"
            element={
              <>
                <SignedIn>
                  <FeedbackScreen />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/history"
            element={
              <>
                <SignedIn>
                  <HistoryPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/goals"
            element={
              <>
                <SignedIn>
                  <GoalsPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </Router >
    </ThemeProvider>
  );
}

export default App;
