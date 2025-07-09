import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/barre.css'; 

const header = ({ livreur }) => {
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
                  <Link to="/livreur/pages/Historique">
                    <i className="bi bi-truck"></i> Historique
                  </Link>
                </li>
                <li>
                  <Link to="/livreur/pages/Parametre">
                    <i className="bi bi-gear"></i> Paramètre
                  </Link>
                </li>
              </ul>
              <ul className="dead">
                <li>
                  <Link to="/livreur/logoutLivreur">
                    <i className="bi bi-box-arrow-right"></i> Déconnexion
                  </Link>
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
              <img src="/assets/profil/profil.jpg" alt="profil" />
              <span>{livreur?.nom}</span>
              <i className="bi bi-caret-down-fill"></i>
              <span id="voyant"></span>
            </div>
            <ul id="deco-profil">
              <li><a href="#">Edit Profil</a></li>
              <li>
                <button
                  onClick={() => {
                    axios.get('http://localhost:3000/api/livreur/logoutLivreur', {
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
    </>
  );
};

export default header;
