import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Historique from './pages/Historique';
import Commande from './pages/Commande';

const ClientApp = () => {
  return (
    <div>
      <h1>Interface Client</h1>
      <nav>
        <Link to="pages/accueil">Accueil</Link> |{' '}
        <Link to="pages/commande">Nouvelle Commande</Link> |{' '}
        <Link to="pages/historique">Historique</Link>
      </nav>
      <Routes>
        <Route path="pages/Accueil" element={<Accueil />} />
        <Route path="pages/historique" element={<Historique />} />
        <Route path="pages/commande" element={<Commande />} />
      </Routes>
    </div>
  );
};

export default ClientApp;
