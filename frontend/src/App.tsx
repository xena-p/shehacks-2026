import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup';
import Profile from './pages/Profile';

function App() {
  const userId = localStorage.getItem('user_id');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        {/* 1. Handle the base /profile path */}
        <Route path="/profile" element={<Profile />} />

        {/* 2. Handle the dynamic ID path */}
        <Route path="/profile/:id" element={<Profile />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
