import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';



import AdminApp from './admin/AdminApp';
import ClientApp from './client/ClientApp';
import LivreurApp from './livreur/LivreurApp';

import Accueil_all from './pages/Accueil_all';

import Connect from './pages/Connect';
import Inscrip from './pages/Inscrip';

import Accueil from './client/pages/Accueil'; 

import Dashboard from './livreur/pages/Dashboard'; 


const RoutesConfig = () => {
  return (
    <Routes>
      {/* Redirection racine */}
      <Route path="/" element={<Accueil_all />} />

      {/* Pages publiques */}
      <Route path="/connect" element={<Connect />} />
      <Route path="/inscrip" element={<Inscrip />} />

      {/* Page d'accueil client après login */}
      <Route path="/client/pages/Accueil" element={<Accueil />} /> 


       {/* Page d'accueil livreur après login */}
      <Route path="/livreur/pages/Dashboard" element={<Dashboard />} /> 

      {/* Espaces Admin / Client / Livreur */}
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/client/*" element={<ClientApp />} />
      <Route path="/livreur/*" element={<LivreurApp />} />
    </Routes>
  );
};

export default RoutesConfig;
