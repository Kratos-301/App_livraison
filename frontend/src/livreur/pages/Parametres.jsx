//=============== Parametre.jsx ===============



import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import Header from '../Lheader/Header';
import 'leaflet-routing-machine';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

import '../styles/barre.css';
import '../styles/acc-livreur.css';



const Parametres = () => {

  const navigate = useNavigate();
  const [livreur, setUser] = useState(null);
  const [commande, setCommande] = useState(null);
  const [delivery, setDelivery] = useState(null);

  const socketRef = useRef(null);


  useEffect(() => {
  socketRef.current = io('http://localhost:3000', {
    withCredentials: true,
  });

  const socket = socketRef.current;

  // 🔄 Récupérer les données commande + delivery
  const fetchData = async () => {
    try {
      const [resCommande, resDelivery] = await Promise.all([
        axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true }),
        axios.get('http://localhost:3000/api/delivery/deliLivreur', { withCredentials: true })
      ]);

      if (!resCommande.data.livreur) return navigate('/');

      setUser(resCommande.data.livreur);
      setCommande(resCommande.data.commande);
      setDelivery(resDelivery.data.delivery);

      // 🔔 Informer le backend de la connexion du livreur
      socket.emit('registerLivreur', resCommande.data.livreur.id);

      // 🚪 Rejoindre la room de commande
      if (resCommande.data.commande?.id) {
        socket.emit('joinRoom', resCommande.data.commande.id);
      }

    } catch (err) {
      console.error('Erreur lors du chargement :', err);
      navigate('/');
    }
  };

  fetchData();

  // 🎧 Événements WebSocket
  socket.on("commandeCreated", (data) => {
    console.log("📦 Nouvelle commande reçue", data);
    axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
      .then(res => setCommande(res.data.commande));
  });

  socket.on("commandeConfirmed", (data) => {
    console.log("✅ Commande confirmée", data);
    axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
      .then(res => setCommande(res.data.commande));
  });

  socket.on("CommandeTerminer", (data) => {
    console.log("✅ Commande terminée", data);
    axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
      .then(res => setCommande(res.data.commande));
  });



    socket.on("deliveryCreated", (data) => {
    console.log("✅ Delivery Creer", data);
    axios.get('http://localhost:3000/api/delivery/deliLivreur', { withCredentials: true })
      .then((res) => {
          setCommande(res.data.commande || []);
          setDelivery(res.data.delivery || []);
        });
  });

  //   socket.on("CommandeTerminer", (data) => {
  //   console.log("✅ CommandeTerminer", data);
  //   axios.get('http://localhost:3000/api/delivery/deliLivreur', { withCredentials: true })
  //     .then((res) => {
  //         setDelivery(res.data.delivery || []);
  //       });
  // });

  
      socket.on("commandeConfirmed", (data) => {
    console.log("✅ commandeConfirmed", data);
    axios.get('http://localhost:3000/api/delivery/deliLivreur', { withCredentials: true })
      .then((res) => {
          setDelivery(res.data.delivery || []);
        });
  });


        socket.on("DeliveryUpdadeTerminer", (data) => {
    console.log("✅ DeliveryUpdadeTerminer", data);
    axios.get('http://localhost:3000/api/delivery/deliLivreur', { withCredentials: true })
      .then((res) => {
          setDelivery(res.data.delivery);
        });
  });

  socket.on("livreurStatusChange", ({ id, status }) => {
    console.log(`🟢 Livreur ${id} est maintenant ${status}`);
  });


    socket.on("disconnect", ({ id, status }) => {
    console.log(`🟢 Livreur ${id} s'est tout a l'heure ${status}`);
  });

  socket.on("commandeAnnulee", (data) => {
    console.log("❌ Commande annulée", data);
    setCommande(null);
  });

  return () => {
    socket.disconnect(); // ✅ Déconnexion propre
  };
}, [navigate]);



  if (!livreur) return null;

  return (
    <>
      <div className="mes-barre">
        <Header livreur={livreur} />
      </div>

      <div className="main-content" id="continer">
          <> 
        <h1>Parametre</h1>
            <div className="all-form djolo">
      <div className="lpm">
        <form className='lploki'>
          <div className="tgh">
             <div className="btn">
                <label htmlFor="file-upload" className="custom-file-uploadPa">
                  <img className="preview-img" src={`http://localhost:3000/uploads/livreurs/${livreur.photo}`} alt="Photo livreur"  />
                </label>
                

              </div>
            <div className="meute">
              <div className="btn1">
                <label htmlFor="livreur-nom">Nom Complet</label>
                <i className="bi bi-person-fill"></i>
                <input
                  type="text"
                  name="nom"
                  id="livreur-nom"
                  value={livreur.nom}
                  readOnly
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
                  value={livreur.telephone}
                  readOnly
                
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
                  
                  value={livreur.cni}
                  readOnly
                />
              </div>
              <div className="btn1">
                <label htmlFor="livreur-marque-moto">Identifiant de ma moto</label>
                <i class="bi bi-person-badge"></i>
                <input
                  type="text"
                  name="marque_moto"
                  id="livreur-marque-moto"
                  placeholder="Apsonic aloba noir"
                  value={livreur.marque_moto}
                  readOnly
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
                  value={livreur.email}
                  readOnly
                />
              </div>
            </div>
            <div className="meute">
              <div className="btn1">
                <label htmlFor="livreur-cni">Latitude</label>
                <i className="bi bi-envelope-fill"></i>
                <input
                  type="text"
                  name="num_cni"
                  id="livreur-cni"
                  
                  value={livreur.lat}
                  readOnly
                />
              </div>
              <span></span>
              <div className="btn1">
                <label htmlFor="livreur-marque-moto">Longitude</label>
                <i class="bi bi-person-badge"></i>
                <input
                  type="text"
                  name="marque_moto"
                  id="livreur-marque-moto"
                  placeholder="Apsonic aloba noir"
                  value={livreur.long}
                  readOnly
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      <h2>Pour tout modification veillez vous rendre au siège de Livraison Dabou</h2>
    </div>
        <div className="dashboard-livreur">
        
        </div>
        </>
      </div>
    </>
  );
};





  {/* Debug - Pour vérifier les données si besoin */}
  {/* <pre>{JSON.stringify(commande, null, 2)}</pre>
  <pre>{JSON.stringify(delivery, null, 2)}</pre> */}



export default Parametres;
