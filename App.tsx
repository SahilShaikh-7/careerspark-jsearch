
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Settings from './pages/Settings';
import { ConfigurationGuard } from './components/ConfigurationGuard';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <ConfigurationGuard>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </ConfigurationGuard>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
