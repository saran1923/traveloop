import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import PublicTrip from './pages/PublicTrip';
import Budget from './pages/Budget';
import Packing from './pages/Packing';
import Notes from './pages/Notes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<Auth />} />

        {/* Public share — no auth needed */}
        <Route path="/share/:tripId" element={<PublicTrip />} />

        {/* Protected app routes */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"                element={<Dashboard />} />
          <Route path="trips"                    element={<MyTrips />} />
          <Route path="trips/new"                element={<CreateTrip />} />
          <Route path="trip/:tripId/build"       element={<ItineraryBuilder />} />
          <Route path="trip/:tripId/view"        element={<ItineraryView />} />
          <Route path="trip/:tripId/budget"      element={<Budget />} />
          <Route path="trip/:tripId/packing"     element={<Packing />} />
          <Route path="trip/:tripId/notes"       element={<Notes />} />

          <Route path="explore" element={
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center' }}>
              <p style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(2.5rem,6vw,4rem)', fontWeight:700, fontStyle:'italic', color:'#fff' }}>Explore</p>
              <p style={{ color:'#444', marginTop:12, fontSize:14 }}>Destination discovery engine — coming soon.</p>
            </div>
          } />

          <Route path="profile" element={
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center' }}>
              <p style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(2.5rem,6vw,4rem)', fontWeight:700, fontStyle:'italic', color:'#fff' }}>Profile</p>
              <p style={{ color:'#444', marginTop:12, fontSize:14 }}>Your travel identity — coming soon.</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
