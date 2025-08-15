import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';



import AdminApp from './admin/AdminApp';
import ClientApp from './client/ClientApp';
import LivreurApp from './livreur/LivreurApp';

import Accueil_all from './pages/Accueil_all';

import Connect from './pages/Connect';
import Inscrip from './pages/Inscrip';

import Accueil from './client/pages/Accueil'; 
import Commande from './client/pages/Commande'; 
import Historique from './client/pages/Historique'; 
import Parametre from './client/pages/Parametre'; 

import Dashboard from './livreur/pages/Dashboard'; 
import Historiques from './livreur/pages/Historiques'; 
import Parametres from './livreur/pages/Parametres'; 


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
      {/* Page d'accueil client Commande */}
      <Route path="/client/pages/Commande" element={<Commande />} />
      {/* Page d'accueil client Historique */}
      <Route path="/client/pages/Historique" element={<Historique />} />
      {/* Page d'accueil client Parametre */}
      <Route path="/client/pages/Parametre" element={<Parametre />} />




    {/* --------------------------------------- */}




       {/* Page d'accueil livreur après login */}
      <Route path="/livreur/pages/Dashboard" element={<Dashboard />} /> 
      {/* Page Historique livreur après login */}
      <Route path="/livreur/pages/Historiques" element={<Historiques />} /> 
      {/* Page Parametre livreur après login */}
      <Route path="/livreur/pages/Parametres" element={<Parametres />} /> 



      {/* Espaces Admin / Client / Livreur */}
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/client/*" element={<ClientApp />} />
      <Route path="/livreur/*" element={<LivreurApp />} />
    </Routes>
  );
};

export default RoutesConfig;
