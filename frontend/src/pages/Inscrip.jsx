import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles/Inscrip.css'; 

const Inscrip = () => {
  // État pour suivre le type sélectionné
  const [userType, setUserType] = useState('client');

  // Gestion clics boutons Client / Livreur
  const handleClickClient = () => setUserType('client');
  const handleClickLivreur = () => setUserType('livreur');

  return (
    <div className="all">
      <div className='acc-header'>
        <div className="logo">
          <Link to="/"><img src="/assets/logo/logo.png" alt="" /></Link>
        </div>

        <div className='insc-conn'>
          <div>
            <Link to="/connect">Connexion</Link>
          </div>
        </div>
      </div>
      <h2>
        <span>B</span>ienvenue sur la page d'Inscription jjjbjjjjjjgjgjgjgjuug<br />
        Merci <span>de bien remplir les</span> champs
      </h2>

      <div className="giga">
        <div className="indic">
          <button id="droite" onClick={handleClickClient}>Client</button>
          <button id="gauche" onClick={handleClickLivreur}>Livreur</button>
        </div>

        <div className="giga-form">
          {/* Formulaire Client */}
          {userType === 'client' && (
            <div className="all-form">
              <div className="lpm">
                <h1>Inscription Client</h1>
                <form action="/clientAuth/registerUser" method="POST">
                  <div className="tgh">
                    <div className="meute">
                      <div className="btn1">
                        <label htmlFor="client-nom">Nom</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="text"
                          name="nom"
                          id="client-nom"
                          placeholder="Kouakou florence ylane sonia"
                          required
                        />
                      </div>
                      <div className="btn1">
                        <label htmlFor="client-telephone">Téléphone</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="tel"
                          name="telephone"
                          id="client-telephone"
                          placeholder="0102030405"
                          required
                        />
                      </div>
                    </div>

                    <div className="seul">
                      <div className="btn14">
                        <label htmlFor="client-email">Email</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="email"
                          name="email"
                          id="client-email"
                          placeholder="abcde1234@gmail.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="meute">
                      <div className="btn1">
                        <label htmlFor="client-motdepasse">Mot de passe</label>
                        <i className="bi bi-lock-fill"></i>
                        <input
                          type="password"
                          name="motdepasse"
                          id="client-motdepasse"
                          placeholder=""
                          required
                        />
                      </div>
                      <div className="btn1">
                        <label htmlFor="client-confirmation">Confirmer le mot de passe</label>
                        <i className="bi bi-lock-fill"></i>
                        <input
                          type="password"
                          name="confirmation"
                          id="client-confirmation"
                          placeholder=""
                          required
                        />
                      </div>
                    </div>

                    <div className="btn2">
                      <input type="submit" value="S'enregistrer" />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Formulaire Livreur */}
          {userType === 'livreur' && (
            <div className="all-form">
              <div className="lpm">
                <h1>Inscription Livreur</h1>
                <form action="/livreurAuth/registerUser" method="POST">
                  <div className="tgh">
                    <div className="meute">
                      <div className="btn1">
                        <label htmlFor="livreur-nom">Nom</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="text"
                          name="nom"
                          id="livreur-nom"
                          placeholder="Kouakou florence ylane sonia"
                          required
                        />
                      </div>
                      <div className="btn1">
                        <label htmlFor="livreur-telephone">Téléphone</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="tel"
                          name="telephone"
                          id="livreur-telephone"
                          placeholder="0102030405"
                          required
                        />
                      </div>
                    </div>

                    <div className="seul">
                      <div className="btn14">
                        <label htmlFor="livreur-email">Email</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="email"
                          name="email"
                          id="livreur-email"
                          placeholder="abcde1234@gmail.com"
                          required
                        />
                      </div>
                      <div className="btn14">
                        <label htmlFor="livreur-marque-moto">Identifiant de ma moto</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="text"
                          name="marque_moto"
                          id="livreur-marque-moto"
                          placeholder="Apsonic aloba noir"
                          required
                        />
                      </div>
                    </div>

                    <div className="meute">
                      <div className="btn1">
                        <label htmlFor="livreur-motdepasse">Mot de passe</label>
                        <i className="bi bi-lock-fill"></i>
                        <input
                          type="password"
                          name="motdepasse"
                          id="livreur-motdepasse"
                          placeholder=""
                          required
                        />
                      </div>
                      <div className="btn1">
                        <label htmlFor="livreur-confirmation">Confirmer le mot de passe</label>
                        <i className="bi bi-lock-fill"></i>
                        <input
                          type="password"
                          name="confirmation"
                          id="livreur-confirmation"
                          placeholder=""
                          required
                        />
                      </div>
                    </div>

                    <div className="btn2">
                      <input type="submit" value="S'enregistrer" />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <main id="all-form2" className={`all-form2 ${userType}`}>
            <h3>Je suis un {userType === 'client' ? 'client' : 'livreur'}</h3>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Inscrip;
