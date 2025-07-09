import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './styles/Connect.css';
import { useNavigate } from 'react-router-dom';




const Connect = () => {
  const navigate = useNavigate();

  const [isClient, setIsClient] = useState(true);

  const [clientData, setClientData] = useState({
    telephone: '',
    motdepasse: ''
  });

  const [livreurData, setLivreurData] = useState({
    email: '',
    motdepasse: ''
  });


  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/clientAuth/loginUser', clientData, {
        withCredentials: true
      });
       console.log('✅ Client connecté :', res.data);
      navigate('/client/pages/Accueil');
    } catch (err) {
      console.error('❌ Erreur client :', err.response?.data || err.message);
    }
  };

  const handleLivreurSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/livreurAuth/loginUser', livreurData, {
        withCredentials: true
      });
      console.log('✅ Livreur connecté :', res.data);
      navigate('/livreur/pages/Dashboard');
    } catch (err) {
      console.error('❌ Erreur livreur :', err.response?.data || err.message);
    }
  };

  return (
    <div className="connect-page">
      <div className="header-connect">
        <div>
            <Link to="/">Accueil</Link>
        </div>
        <div><h2>Merci de renseigner tout les champs</h2></div>
        <div>
            <Link to="/inscrip">Inscription</Link>
        </div>
      </div>

      <div className="giga">
        <div className="indic">
          <button id="droite" onClick={() => setIsClient(true)}>Client</button>
          <button id="gauche" onClick={() => setIsClient(false)}>Livreur</button>
        </div>

        <div className="giga-form">
            <div className="all-form">
              <div className="lpm">
                <h1>Connexion Client</h1>
                <form onSubmit={handleClientSubmit}>
                  <div className="tgh">
                    <div className="seul">
                      <div className="btn14">
                        <label htmlFor="telephone">Téléphone</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="tel"
                          name="telephone"
                          id="telephone"
                          value={clientData.telephone}
                          onChange={(e) => setClientData({ ...clientData, telephone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="meute">
                      <div className="btn1">
                        <label htmlFor="motdepasse">Mot de passe</label>
                        <i className="bi bi-lock-fill"></i>
                        <input
                          type="password"
                          name="motdepasse"
                          id="motdepasse_client"
                          value={clientData.motdepasse}
                          onChange={(e) => setClientData({ ...clientData, motdepasse: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="btn2">
                      <input type="submit" value="Connexion" />
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="all-form">
              <div className="lpm">
                <h1>Connexion Livreur</h1>
                <form onSubmit={handleLivreurSubmit}>
                  <div className="tgh">
                    <div className="seul">
                      <div className="btn14">
                        <label htmlFor="email">Email</label>
                        <i className="bi bi-envelope-fill"></i>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={livreurData.email}
                          onChange={(e) => setLivreurData({ ...livreurData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="meute">
                      <div className="btn1">
                        <label htmlFor="motdepasse">Mot de passe</label>
                        <i className="bi bi-lock-fill"></i>
                        <input
                          type="password"
                          name="motdepasse"
                          id="motdepasse_livreur"
                          value={livreurData.motdepasse}
                          onChange={(e) => setLivreurData({ ...livreurData, motdepasse: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="btn2">
                      <input type="submit" value="Connexion" />
                    </div>
                  </div>
                </form>
              </div>
            </div>

          <main
            id="Couverture"
            className={`Couverture ${isClient ? 'droite' : 'gauche'}`}
            style={{
              borderRadius: isClient ? '10px 0 0 10px' : '0 10px 10px 0',
            }}
          >
            <h3>{isClient ? 'Bienvenue cher client , merci de bien vouloir remplir tout les champs , vos livreur sont impatient de vous servir' : 'Bienvenue cher livreur , rejoignez la partie en remplissant vos donnée avec précaution'}</h3>
          </main>
        </div>
      </div>
    </div>
  );
};


export default Connect;
