//========= Accueil.jsx============


import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import Header from '../Header/Header';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { io } from 'socket.io-client';

import '../styles/barre.css';
import '../styles/attente.css';
import '../styles/accueil.css';

const Accueil = () => {
  const [client, setUser] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [distance, setDistance] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [position, setPosition] = useState(null);
  const [gpsError, setGpsError] = useState(false);

  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const livreurMarkerRef = useRef(null);
  const socketRef = useRef(null);



//Websocket

  useEffect(() => {
    // Initialisation socket
    socketRef.current = io('http://localhost:3000', {
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Requête initiale
    axios.get('http://localhost:3000/api/commande/accueil', { withCredentials: true })
      .then(res => {
        setUser(res.data.client);
        setCommandes(res.data.commandes || []);
        setLivreurs(res.data.livreurs || []);
      })
      .catch(console.error);

    // Écouteurs d'événements socket
    socket.on("commandeCreated", (data) => {
      console.log("📦 Nouvelle commande reçue", data);
      axios.get('http://localhost:3000/api/commande/accueil', { withCredentials: true })
        .then(res => {
    setUser(res.data.client);
    setCommandes(res.data.commandes || []);
    setLivreurs(res.data.livreurs || []); // ✅ rafraîchit les livreurs !
  });
        
    });

    socket.on("commandeConfirmed", (data) => {
      console.log("✅ Commande confirmée", data);
      axios.get('http://localhost:3000/api/commande/accueil', { withCredentials: true })
        .then(res => setCommandes(res.data.commandes));
    });


    
    socket.on("livreurStatusChange", ({ id, status }) => {
      console.log(`🟢 Livreur ${id} est maintenant ${status}`);
      axios.get('http://localhost:3000/api/commande/accueil', { withCredentials: true })
  .then(res => {
    setUser(res.data.client);
    setCommandes(res.data.commandes || []);
    setLivreurs(res.data.livreurs || []); // ✅ rafraîchit les livreurs !
  });

    });

    socket.on("commandeAnnulee", (data) => {
  console.log("❌ Commande annulée", data);

  axios.get('http://localhost:3000/api/commande/accueil', { withCredentials: true })
    .then(res => {
      setUser(res.data.client);
      setCommandes(res.data.commandes || []);
      setLivreurs(res.data.livreurs || []); // ✅ actualise les livreurs aussi
    });
});


    return () => {
      socket.disconnect();
    };
  }, []);



  const livreurIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  const clientIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  const commandeEnCours = commandes.find(cmd => cmd.statut === 1 && cmd.statut_2 === 1 && cmd.statut_3 === 0);



  const formVisible = useMemo(() => {
    return !commandes.some(cmd =>
      (cmd.statut === 1 && cmd.statut_2 === 0 && cmd.statut_3 === 0) ||
      (cmd.statut === 1 && cmd.statut_2 === 1 && cmd.statut_3 === 0)
    );
  }, [commandes]);

  // Mise à jour position GPS côté client
  useEffect(() => {
    const updateGPS = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsError(false);
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setPosition(coords);
          axios.post('http://localhost:3000/api/commande/updatePositionCli', coords, {
            withCredentials: true
          }).catch(console.error);
        },
        (err) => {
          console.warn('GPS error:', err.message);
          setGpsError(true);
        }
      );
    };

    updateGPS();
    const interval = setInterval(updateGPS, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapRef.current && position) {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;

      const map = L.map('map').setView([position.latitude, position.longitude], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapRef.current = map;
    }
  }, [position]);

  useEffect(() => {
    if (!commandeEnCours || !position || !mapRef.current) return;

    const start = L.latLng(position.latitude, position.longitude);
    const end = L.latLng(commandeEnCours.latitude, commandeEnCours.longitude);

    if (!routingControlRef.current) {
      routingControlRef.current = L.Routing.control({
        waypoints: [start, end],
        routeWhileDragging: false,
        lineOptions: { styles: [{ color: 'blue', weight: 5 }] },
        addWaypoints: false,
        createMarker: () => null
      }).addTo(mapRef.current);

      routingControlRef.current.on('routesfound', (e) => {
        const route = e.routes[0];
        setDistance((route.summary.totalDistance / 1000).toFixed(2));
      });

      if (!startTime) setStartTime(Date.now());
    } else {
      routingControlRef.current.setWaypoints([start, end]);
    }

    if (!livreurMarkerRef.current) {
      livreurMarkerRef.current = L.marker(start, { icon: livreurIcon }).addTo(mapRef.current).bindPopup("📦 Livreur");
    } else {
      livreurMarkerRef.current.setLatLng(start);
    }

    if (!mapRef.current._clientMarker) {
      const clientMarker = L.marker(end, { icon: clientIcon }).addTo(mapRef.current).bindPopup("🧍‍♂️ Client");
      mapRef.current._clientMarker = clientMarker;
    }

    mapRef.current.setView(start);
  }, [commandeEnCours, position, startTime]);

  const handleGeoSubmit = (livreur) => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const payload = {
          client_id: client.id,
          client_nom: client.nom,
          client_num: client.telephone,
          livreur_id: livreur.id,
          livreur_nom: livreur.nom,
          livreur_marque_moto: livreur.marque_moto,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          statut: "1",
          statut_2: "0",
          statut_3: "0",
          disponibilite: "0"
        };

        try {
          await axios.post('http://localhost:3000/api/commande/accueil', payload, {
            withCredentials: true
          });
          window.location.href = '/client/pages/Accueil';
        } catch (err) {
          console.error('Erreur lors de l’envoi de la commande', err);
        }
      },
      err => {
        alert("⛔ GPS non autorisé. Impossible de continuer.");
      }
    );
  };

  if (!client) return null;

  return (
    <>
      <div className="mes-barre">
        <Header client={client} />
      </div>
      
      <div className="main-content client" id="continer">

        {formVisible && (
          <>
            <h1>Bienvenue {client.nom}</h1>
            <div className="all-form" id="okjik">
              <div id="zone-livreurs">
                <h3>Les livreurs</h3>
                {livreurs.length === 0 ? (
                  <div className="alert alert-warning text-center">
                    🛑 Aucun livreur n’est actuellement en ligne.
                  </div>
                ) : (
                  livreurs.map(livreur => (
                    <div key={livreur.id} className={`livreur-card ${livreur.est_occupe ? 'occupe' : 'disponible'}`}>
                      <img src="/assets/img/thygujlokdded.png" alt="livreur" />
                      <span className="livreur-nom">{livreur.nom}</span>
                      <span>{livreur.marque_moto}</span>
                      <div className="commander">
                        {livreur.est_occupe ? (
                          <span className="statut" style={{ color: 'red' }}>🔴 Occupé</span>
                        ) : (
                          <>
                            <div className="affiju d-flex">
                              <span className="statut" style={{ color: 'green',  }}>🟢</span>
                              <input type="button" value="Commander" onClick={() => handleGeoSubmit(livreur)} />
                            </div>
                            
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {commandeEnCours && (
          <div className='map-container'>
            <div id="map" style={{ height: '400px', marginTop: '20px' }}></div>
            <p>Distance restante : {distance} km</p>
            <p>Temps écoulé : {startTime ? Math.floor((Date.now() - startTime) / 1000) + 's' : '...'}</p>
            <p>
              <button
                          className="btn btn-danger btn-sm"
                          onClick={async () => {
                            // const confirmer = window.confirm("Annuler ?");
                            // if (!confirmer) return;

                            try {
                              await axios.post(
                                `http://localhost:3000/api/commande/annuler/${commandeEnCours.id}`,
                                {},
                                { withCredentials: true }
                              );

                              setCommandes(prev => prev.filter(c => c.id !== commandeEnCours.id));
                            } catch (err) {
                              console.error("❌ Erreur lors de l'annulation :", err);
                            }
                          }}
                        >
                          Annuler
                        </button>
                        </p>
          </div>
        )}

        {commandes.map(cmd => {
          const date = new Date(cmd.date_commande).toLocaleString();
          if (cmd.statut === 1 && cmd.statut_2 === 0 && cmd.statut_3 === 0) {
            return (
              <div key={cmd.id}>
                <table className="table table-striped mt-4">
                  <thead>
                    <tr><th>Livreur</th><th>Moto</th><th>Statut</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{cmd.livreur_nom}</td>
                      <td>{cmd.livreur_marque_moto}</td>
                      <td>En cours</td>
                      <td>{date}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={async () => {
                            // const confirmer = window.confirm("Annuler ?");
                            // if (!confirmer) return;

                            try {
                              await axios.post(
                                `http://localhost:3000/api/commande/annuler/${cmd.id}`,
                                {},
                                { withCredentials: true }
                              );

                              setCommandes(prev => prev.filter(c => c.id !== cmd.id));
                            } catch (err) {
                              console.error("❌ Erreur lors de l'annulation :", err);
                            }
                          }}
                        >
                          Annuler
                        </button>

                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="loader-container">
                  <div className="loader"></div>
                  <p>En attente de validation par le livreur...</p>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </>
  );
};

export default Accueil;