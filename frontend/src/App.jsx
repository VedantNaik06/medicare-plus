import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { CapsuleMark } from './components/ui/Logo.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/AuthPages.jsx').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/AuthPages.jsx').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Medicines = lazy(() => import('./pages/Medicines.jsx'));
const MedicineForm = lazy(() => import('./pages/MedicineForm.jsx'));
const Appointments = lazy(() => import('./pages/Appointments.jsx'));
const Records = lazy(() => import('./pages/Records.jsx'));
const Tests = lazy(() => import('./pages/Tests.jsx'));
const TestForm = lazy(() => import('./pages/TestForm.jsx'));
const TestDetail = lazy(() => import('./pages/TestDetail.jsx'));
const TestCompare = lazy(() => import('./pages/TestCompare.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function FullPageLoader() {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-screen place-items-center" role="status">
      <div className="flex flex-col items-center gap-3">
        <CapsuleMark size={56} />
        <p className="text-slate-600">{t('common.loading')}</p>
      </div>
    </div>
  );
}

// Private pages: wait until we know about the session, then allow or redirect to login.
function Protected({ children }) {
  const { user, loading, loggedOut } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  // After choosing "Log out" go to the home page. Otherwise (never logged in, or session expired) go to login.
  if (!user) return loggedOut ? <Navigate to="/" replace /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

// Login/Register pages: logged-in people go straight to the dashboard.
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      <Route path="/app" element={<Protected><AppLayout /></Protected>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="medicines/new" element={<MedicineForm />} />
        <Route path="medicines/:id/edit" element={<MedicineForm />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="records" element={<Records />} />
        <Route path="tests" element={<Tests />} />
        <Route path="tests/new" element={<TestForm />} />
        <Route path="tests/compare" element={<TestCompare />} />
        <Route path="tests/:id" element={<TestDetail />} />
        <Route path="tests/:id/edit" element={<TestForm />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}
