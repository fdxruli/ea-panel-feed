// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicFeedback } from './pages/public/PublicFeedback';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<PublicFeedback />} />

        {/* Login — accesible sin sesión */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard — protegido: ProtectedRoute verifica sesión ANTES
            de que AdminDashboard se monte, eliminando el flash. */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;