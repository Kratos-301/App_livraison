//=============== Historique.jsx ===============




import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from '../Lheader/Header';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

import '../styles/barre.css';
import '../styles/acc-livreur.css';



const Historiques = () => {
    const [type, setType] = useState("");
    const [paie, setPaie] = useState("");
  const navigate = useNavigate();
  const [livreur, setUser] = useState(null);
  const [commande, setCommande] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [position, setPosition] = useState(null);
  const [gpsError, setGpsError] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [distanceRestante, setDistanceRestante] = useState(null);

  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const livreurMarkerRef = useRef(null);
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
          <h1>Historique</h1>
        <div className="dashboard-livreur">
        
        <h1> </h1>
        </div>
      </div>
    </>
  );
};





  {/* Debug - Pour vérifier les données si besoin */}
  {/* <pre>{JSON.stringify(commande, null, 2)}</pre>
  <pre>{JSON.stringify(delivery, null, 2)}</pre> */}



export default Historiques;
