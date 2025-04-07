import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import Navbar from '@components/layout/Navbar';
import Login from '@components/auth/Login';
import Register from '@components/auth/Register';
import Home from '@components/game/Home';
import CharacterCreation from '@components/game/CharacterCreation';
import Combat from '@components/game/Combat';
import Inventory from '@components/game/Inventory';
import QuestSystem from '@components/game/QuestSystem';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import ErrorBoundary from '@components/layout/ErrorBoundary';
import NotFound from '@components/layout/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark bg-texture">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/create-character" element={
                  <ProtectedRoute>
                    <CharacterCreation />
                  </ProtectedRoute>
                } />
                <Route path="/combat" element={
                  <ProtectedRoute>
                    <Combat />
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                } />
                <Route path="/quests" element={
                  <ProtectedRoute>
                    <QuestSystem />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
