import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './styles/Inscrip.css'; 

const Inscrip = () => {
  // État pour suivre le type sélectionné
  const [userType, setUserType] = useState('client');

  // Gestion clics boutons Client / Livreur
  const handleClickClient = () => setUserType('client');
  const handleClickLivreur = () => setUserType('livreur');


// Traitement de l'inscription livreur
const [livreurData, setLivreurData] = useState({
  nom: '',
  email: '',
  telephone: '',
  marque_moto: '',
  num_cni: '',
  pp: null,
  motdepasse: '',
  confirmation: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLivreurData({ ...livreurData, [name]: value });
  };

const handleRegisterSubmitLivreur = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    for (const key in livreurData) {
      formData.append(key, livreurData[key]);
    }

    const res = await axios.post(
      'http://localhost:3000/livreurAuth/registerUser',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      }
    );

    alert('Inscription réussie');
    navigate('/livreur/pages/Dashboard');

  } catch (err) {
    const erreur = err.response?.data?.erreur || 'Erreur inconnue';
    alert(erreur);
    console.error('Erreur :', erreur);
  }
};


// Traitement de l'inscription client
const [ClientData, setClientData] = useState({
  nom: '',
  email: '',
  telephone: '',
  motdepasse: '',
  confirmation: ''
  });


  const handleChanges = (e) => {
    const { name, value } = e.target;
    setClientData({ ...ClientData, [name]: value });
  };

const handleRegisterSubmitClient = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      'http://localhost:3000/api/clientAuth/registerUser',
      ClientData,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    );

    alert('Inscription réussie');
    navigate('/client/pages/Accueil');

  } catch (err) {
    const erreur = err.response?.data?.erreur || 'Erreur inconnue';
    alert(erreur);
    console.error('Erreur :', erreur);
  }
};


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
                <form onSubmit={handleRegisterSubmitClient}>
                  <div className="tgh">
                    <div className="meute">
                      <div className="btn1">
                        <label htmlFor="client-nom">Nom</label>
                        <i className="bi bi-person-fill"></i>
                        <input
                          type="text"
                          name='nom'
                          value={ClientData.nom}
                          onChange={handleChanges}
                          id="client-nom"
                          placeholder="Kouakou florence ylane sonia"
                          
                          required
                        />
                      </div>
                      <div className="btn1">
                        <label htmlFor="client-telephone">Téléphone</label>
                        <i className="bi bi-telephone-fill"></i>
                        <input
                          type="tel"
                          name="telephone"
                          value={ClientData.telephone}
                          onChange={handleChanges}
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
                          value={ClientData.email}
                          onChange={handleChanges}
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
                          value={ClientData.motdepasse}
                          onChange={handleChanges}
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
                          value={ClientData.confirmation}
                          onChange={handleChanges}
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
        <form onSubmit={handleRegisterSubmitLivreur}>
          <div className="tgh">
             <div className="btn">
                <label htmlFor="livreur-tof">Profil</label>
                <i className="bi bi-person-fill"></i>
                <input
                  type="file"
                  name="pp"
                  accept="image/*"
                  onChange={(e) => setLivreurData({ ...livreurData, pp: e.target.files[0] })}
                />
              </div>
            <div className="meute">
              <div className="btn1">
                <label htmlFor="livreur-nom">Nom Complet</label>
                <i className="bi bi-person-fill"></i>
                <input
                  type="text"
                  name="nom"
                  id="livreur-nom"
                  placeholder="Kouakou florence ylane sonia"
                  value={livreurData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="btn1">
                <label htmlFor="livreur-telephone">Téléphone</label>
                <i className="bi bi-telephone-fill"></i>
                <input
                  type="tel"
                  name="telephone"
                  id="livreur-telephone"
                  placeholder="0102030405"
                  value={livreurData.telephone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="meute">
              <div className="btn1">
                <label htmlFor="livreur-cni">N° CNI</label>
                <i className="bi bi-envelope-fill"></i>
                <input
                  type="text"
                  name="num_cni"
                  id="livreur-cni"
                  placeholder="CNI123456"
                  value={livreurData.num_cni}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="btn1">
                <label htmlFor="livreur-marque-moto">Identifiant de ma moto</label>
                <i className="bi bi-envelope-fill"></i>
                <input
                  type="text"
                  name="marque_moto"
                  id="livreur-marque-moto"
                  placeholder="Apsonic aloba noir"
                  value={livreurData.marque_moto}
                  onChange={handleChange}
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
                  value={livreurData.email}
                  onChange={handleChange}
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
                  value={livreurData.motdepasse}
                  onChange={handleChange}
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
                  value={livreurData.confirmation}
                  onChange={handleChange}
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
