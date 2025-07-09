import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Livraison from './pages/Livraison';
import Historique from './pages/Historique';

const LivreurApp = () => {
  return (
    <div>
      <h1>Interface Livreur</h1>
      <nav>
        <Link to="dashboard">Dashboard</Link> |{' '}
        <Link to="livraison">Livraisons</Link> |{' '}
        <Link to="historique">Historique</Link>
      </nav>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="livraison" element={<Livraison />} />
        <Route path="historique" element={<Historique />} />
      </Routes>
    </div>
  );
};

export default LivreurApp;
