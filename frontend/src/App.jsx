import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MeetingDetail from './pages/MeetingDetail';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleUploadClick() {
    if (location.pathname === '/') {
      window.__echonotesOpenUpload?.();
    } else {
      navigate('/', { state: { openUpload: true } });
    }
  }

  return (
    <>
      <Navbar onUploadClick={handleUploadClick} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/meetings/:id" element={<MeetingDetail />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}