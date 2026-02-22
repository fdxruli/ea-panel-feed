import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Crearemos estos componentes en el siguiente paso
import { PublicFeedback } from './pages/public/PublicFeedback';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<PublicFeedback />} />
        
        {/* Rutas de Administración */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Fallback para URLs inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;