import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


import '../styles/barre.css'; // ou ajuste le chemin selon ta structure

const Header = ({ client }) => {


  const navigate = useNavigate();



  return (
    <>
      <div className="all-barre-verticale">
        <div className="section-barre-verticale">
          <div className="corps-barre-verticale">
            <div className="logo">
              <img src="/assets/logo/logo.png" alt="logo" />
            </div>
            <div className="touches">
              <ul className="haut-touches">
                <li><Link to="/client/pages/Accueil">Dashboard</Link></li>
                <li><Link to="/client/pages/Commande">Commande</Link></li>
                <li><Link to="/client/pages/Historique">Historique</Link></li>
                <li><Link to="/client/pages/Parametre">Parametre</Link></li>
              </ul>
              <ul className="deads">
                <li>                
                  <button
                  onClick={() => {
                    axios.get('http://localhost:3000/api/client/logoutClient', {
  withCredentials: true,
                      credentials: 'include',
                    })
                      .then(() => {
                        window.location.href = '/'; // ou vers loginUser si besoin
                      })
                      .catch(err => {
                        console.error("Erreur lors de la déconnexion", err);
                      });
                  }}
                  className="btn btn-link text-danger"
                >
                  <i className="bi bi-box-arrow-right"></i> Déconnexion
                </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="all-barre-horizontal">
        <div className="corps-horizontal">
          <div className="title-dash">
            <h1>Domaine de demande</h1>
          </div>
          <div id="profil">
            <div id="conprofil">
              <img src="/assets/profil/profil.jpg" alt="profil" />
              <span>{client?.nom}</span>
              <i className="bi bi-caret-down-fill"></i>
              <span id="voyant"></span>
            </div>
            <ul id="deco-profil">
              
              <li>
                <a href="#">Edit Profil</a>
              </li>

              <li>
                <button
                  onClick={() => {
                    axios.get('http://localhost:3000/api/client/logoutClient', {
                      withCredentials: true,
                      credentials: 'include',
                    })
                      .then(() => {
                        window.location.href = '/';
                      })
                      .catch(err => {
                        console.error("Erreur lors de la déconnexion", err);
                      });
                  }}
                  className="btn btn-link text-danger"
                >
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
