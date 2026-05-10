import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import MyTrips from './pages/MyTrips';



function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected App Routes */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trips" element={<MyTrips />} />

          <Route path="explore" element={<div className="text-2xl font-display font-bold">Explore (Coming Soon)</div>} />
          <Route path="profile" element={<div className="text-2xl font-display font-bold">Profile (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
