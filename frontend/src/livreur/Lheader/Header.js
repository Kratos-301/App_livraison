import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/barre.css';

const SOCKET_SERVER_URL = "http://localhost:3000"; // adapte à ton serveur

const Header = ({ livreur }) => {
  const [status, setStatus] = useState('offline'); // online/offline
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!livreur?.id) return;

    // Connexion socket
    socketRef.current = io(SOCKET_SERVER_URL, {
      withCredentials: true,
    });

    // Dès la connexion, on enregistre le livreur côté serveur
    socketRef.current.on('connect', () => {
      console.log('Socket connecté:', socketRef.current.id);
      socketRef.current.emit('registerLivreur', livreur.id);
    });

    // Gestion des changements de statut (online/offline)
    socketRef.current.on('livreurStatusChange', ({ id, status }) => {
      if (id === livreur.id) {
        setStatus(status);
      }
    });

  }, [livreur]);

  const handleLogout = () => {
    axios.get(`${SOCKET_SERVER_URL}/api/livreur/logoutLivreur`, {
      withCredentials: true,
      credentials: 'include',
    })
      .then(() => {
        // Déconnexion socket
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        navigate('/'); // redirection à la racine (ou login)
      })
      .catch(err => {
        console.error("Erreur lors de la déconnexion", err);
      });
  };

  return (
    <>
      {/* Barre verticale */}
      <div className="all-barre-verticale">
        <div className="section-barre-verticale">
          <div className="corps-barre-verticale">
            <div className="logo">
              <img src="/assets/logo/logo.png" alt="logo" />
            </div>
            <div className="touche">
              <ul className="haut-touche">
                <li>
                  <Link to="/livreur/pages/Dashboard">
                    <i className="bi bi-cart-check"></i> Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/livreur/pages/Historiques">
                    <i className="bi bi-truck"></i> Historique
                  </Link>
                </li>
                <li>
                  <Link to="/livreur/pages/Parametres">
                    <i className="bi bi-gear"></i> Paramètre
                  </Link>
                </li>
              </ul>
              <ul className="dead">
                <li>
                  <button onClick={handleLogout} className="btn btn-link text-danger">
                    <i className="bi bi-box-arrow-right"></i> Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Barre horizontale */}
      <div className="all-barre-horizontal">
        <div className="corps-horizontal">
          <div className="title-dash">
            <h1>Contrôle de livreur</h1>
          </div>
          <div id="profil">
            <div id="conprofil">
              <img src={`http://localhost:3000/uploads/livreurs/${livreur.photo}`} alt="Photo livreur" />



              <span>{livreur?.nom}</span>
              <i className="bi bi-caret-down-fill"></i>
              {/* Voyant vert ou rouge selon le statut */}
              <span
                id="voyant"
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: status === 'online' ? 'green' : 'red',
                  marginLeft: '5px',
                }}
                title={status === 'online' ? 'En ligne' : 'Hors ligne'}
              />
            </div>
            <ul id="deco-profil">
              <li><a href="#">Edit Profil</a></li>
              <li>
                <button onClick={handleLogout} className="btn btn-link text-danger">
                  <i className="bi bi-box-arrow-right"></i> Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
