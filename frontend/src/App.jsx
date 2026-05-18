import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ProtectedRoute } from './contexts/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Inicio } from './pages/Inicio';
import EstructuraPresupuestariaUpload from './pages/EstructuraPresupuestariaUpload';
import EstructuraPresupuestariaData from './pages/EstructuraPresupuestariaData';
import CedulaPresupuestaria from './pages/CedulaPresupuestaria';
import Certificacion from './pages/Certificacion';
import Liquidaciones from './pages/Liquidaciones';
import RecuperarContrasena from './pages/RecuperarContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import EntidadRequiriente from './pages/EntidadRequiriente';
import PresupuestoDisponible from './pages/PresupuestoDisponible';
import Reportes from './pages/Reportes';
import ReportePrint from './pages/ReportePrint';
import Auditoria from './pages/Auditoria';
import './App.css';
import { useContext } from 'react';

function AppContent() {
  const { isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
      <Route path="/reporte-print" element={<ReportePrint />} />
      
      {/* Dashboard Layout con rutas anidadas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* Ruta para /dashboard/usuarios */}
        <Route path="usuarios" element={<Usuarios />} />
        
        {/* Ruta para /dashboard/estructura-presupuestaria */}
        <Route path="estructura-presupuestaria" element={<EstructuraPresupuestariaUpload />} />

        {/* Ruta para /dashboard/estructura-presupuestaria-data */}
        <Route path="estructura-presupuestaria-data" element={<EstructuraPresupuestariaData />} />

        {/* Ruta para /dashboard/cedula-presupuestaria */}
        <Route path="cedula-presupuestaria" element={<CedulaPresupuestaria />} />

        {/* Ruta para /dashboard/certificacion */}
        <Route path="certificacion" element={<Certificacion />} />

        {/* Ruta para /dashboard/liquidaciones */}
        <Route path="liquidaciones" element={<Liquidaciones />} />

        {/* Ruta para /dashboard/entidad-requirente */}
        <Route path="entidad-requirente" element={<EntidadRequiriente />} />

        {/* Ruta para /dashboard/presupuesto-disponible */}
        <Route path="presupuesto-disponible" element={<PresupuestoDisponible />} />

        {/* Ruta para /dashboard/reportes */}
        <Route path="reportes" element={<Reportes />} />

        {/* Ruta para /dashboard/auditoria */}
        <Route path="auditoria" element={<Auditoria />} />

        {/* Ruta por defecto del dashboard */}
        <Route 
          index 
          element={<Inicio />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;


