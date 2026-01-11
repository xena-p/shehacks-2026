import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup';
import Profile from './pages/Profile';
import Browse from './pages/Browse';
import Matches from './pages/Matches';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        {/* 1. Handle the base /profile path */}
        <Route path="/profile" element={<Profile />} />

        {/* 2. Handle the dynamic ID path */}
        <Route path="/profile/:id" element={<Profile />} />

        {/* Browse route */}
        <Route path="/browse" element={<Browse />} />

        {/* Matches route */}
        <Route path="/matches" element={<Matches />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
