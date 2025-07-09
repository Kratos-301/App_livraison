import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/barre.css'; // ou ajuste le chemin selon ta structure

const Header = ({ client }) => {
  return (
    <>
      <div className="all-barre-verticale">
        <div className="section-barre-verticale">
          <div className="corps-barre-verticale">
            <div className="logo">
              <img src="/assets/logo/logo.png" alt="logo" />
            </div>
            <div className="touche">
              <ul className="haut-touche">
                <li><a href="/commande/html/page/accueil">Dashboard</a></li>
                <li><a href="/html/page/attente"><i className="bi bi-person"></i> Demande</a></li>
                <li><a href="/html/page/historique"><i className="bi bi-person"></i> Historique</a></li>
                <li><a href="/html/page/parametre"><i className="bi bi-gear"></i> Paramètre</a></li>
              </ul>
              <ul className="dead">
                <li><a href="#"><i className="bi bi-box-arrow-right"></i> Déconnexion</a></li>
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

export default Header;
