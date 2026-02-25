import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Browse from '@/pages/Browse';
import Detail from '@/pages/Detail';
import Admin from '@/pages/Admin';
import AdminLogin from '@/pages/AdminLogin';
import ResearchHistory from '@/pages/ResearchHistory';
import StrategicSummary from '@/pages/StrategicSummary';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/tool/:slug" element={<Detail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/research" element={<ResearchHistory />} />
            <Route path="/summary" element={<StrategicSummary />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
