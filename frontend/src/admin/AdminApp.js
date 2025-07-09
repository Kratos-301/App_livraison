import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Livreurs from './pages/Livreurs';
import Commandes from './pages/Commandes';

const AdminApp = () => {
  return (
    <div>
      <h1>Interface Admin</h1>
      <nav>
        <Link to="dashboard">Dashboard</Link> |{' '}
        <Link to="clients">Clients</Link> |{' '}
        <Link to="livreurs">Livreurs</Link> |{' '}
        <Link to="commandes">Commandes</Link>
      </nav>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="livreurs" element={<Livreurs />} />
        <Route path="commandes" element={<Commandes />} />
      </Routes>
    </div>
  );
};

export default AdminApp;
