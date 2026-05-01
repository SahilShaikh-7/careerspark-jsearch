
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import { ConfigurationGuard } from './components/ConfigurationGuard';

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <ConfigurationGuard>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </Layout>
        </ConfigurationGuard>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
