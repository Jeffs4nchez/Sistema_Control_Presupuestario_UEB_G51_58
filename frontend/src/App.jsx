import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { FiscalYearProvider } from './contexts/FiscalYearContext';
import { ProtectedRoute } from './contexts/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Inicio } from './pages/Inicio';
import CedulaPresupuestaria from './pages/CedulaPresupuestaria';
import Certificacion from './pages/Certificacion';
import Liquidaciones from './pages/Liquidaciones';
import RecuperarContrasena from './pages/RecuperarContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import EntidadRequiriente from './pages/EntidadRequiriente';
import Reportes from './pages/Reportes';
import ReportePrint from './pages/ReportePrint';
import Auditoria from './pages/Auditoria';
import './App.css';
import { useContext } from 'react';
import { can } from './utils/permissions';

// Redirige al dashboard si el usuario no tiene permiso para esa ruta
function RoleRoute({ check, children }) {
  const { user } = useContext(AuthContext);
  if (!check(user)) return <Navigate to="/dashboard" replace />;
  return children;
}

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
        {/* Solo Director y Admin */}
        <Route path="usuarios" element={
          <RoleRoute check={can.verUsuarios}>
            <Usuarios />
          </RoleRoute>
        } />

        <Route path="estructura-presupuestaria" element={<Navigate to="/dashboard/cedula-presupuestaria" replace />} />
        <Route path="estructura-presupuestaria-data" element={<Navigate to="/dashboard/cedula-presupuestaria" replace />} />

        {/* Director, Analista y Admin */}
        <Route path="cedula-presupuestaria" element={
          <RoleRoute check={can.verCedula}>
            <CedulaPresupuestaria />
          </RoleRoute>
        } />

        <Route path="certificacion" element={
          <RoleRoute check={can.verCertificacion}>
            <Certificacion />
          </RoleRoute>
        } />

        <Route path="liquidaciones" element={
          <RoleRoute check={can.verLiquidaciones}>
            <Liquidaciones />
          </RoleRoute>
        } />

        <Route path="unidad-requiriente" element={
          <RoleRoute check={can.verEntidadRequiriente}>
            <EntidadRequiriente />
          </RoleRoute>
        } />

        {/* Todos los roles */}
        <Route path="reportes" element={
          <RoleRoute check={can.verReportes}>
            <Reportes />
          </RoleRoute>
        } />

        {/* Solo Director y Admin */}
        <Route path="auditoria" element={
          <RoleRoute check={can.verAuditoria}>
            <Auditoria />
          </RoleRoute>
        } />

        {/* Ruta por defecto del dashboard */}
        <Route index element={<Inicio />} />
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
        <FiscalYearProvider>
          <AppContent />
        </FiscalYearProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
