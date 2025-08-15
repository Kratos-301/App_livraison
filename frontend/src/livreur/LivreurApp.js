import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Parametres from './pages/Parametres';
import Historique from './pages/Historiques';

const LivreurApp = () => {
  return (
    <div>
      <h1>Interface Livreur</h1>
      <nav>
        <Link to="dashboard">Dashboard</Link> |{' '}
        <Link to="Parametres">Livraisons</Link> |{' '}
        <Link to="historiques">Historique</Link>
      </nav>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="Parametres" element={<Parametres />} />
        <Route path="historiques" element={<Historique />} />
      </Routes>
    </div>
  );
};

export default LivreurApp;
