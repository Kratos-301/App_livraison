//=============== Dashboard.jsx ===============




import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from '../Lheader/Header';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

import '../styles/barre.css';
import '../styles/acc-livreur.css';



const Dashboard = () => {
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




  // Connexion WebSocket
  // useEffect(() => {
  //   socketRef.current = io('http://localhost:3000', {
  //     withCredentials: true,
  //   });

  //   const socket = socketRef.current;

  //   // Charger les données
  //   axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
  //     .then(res => {
  //       if (!res.data.livreur) return navigate('/');
  //       setUser(res.data.livreur);
  //       setCommande(res.data.commande);
  //       setDelivery(res.data.delivery);

  //       // ✅ Informer le backend de la connexion du livreur
  //       socket.emit('registerLivreur', res.data.livreur.id);

  //       // ✅ Rejoindre la room de commande si en cours
  //       if (res.data.commande?.id) {
  //         socket.emit('joinRoom', res.data.commande.id);
  //       }
  //     })
  //     .catch(() => navigate('/'));

  //   // 🎧 Événements WebSocket
  //   socket.on("commandeCreated", (data) => {
  //     console.log("📦 Nouvelle commande reçue", data);
  //     axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
  //       .then(res => setCommande(res.data.commande));
  //   });

  //   socket.on("commandeConfirmed", (data) => {
  //     console.log("✅ Commande confirmée", data);
  //     axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
  //       .then(res => setCommande(res.data.commande));
  //   });

  //    socket.on("CommandeTerminer", (data) => {
  //     console.log("✅ Commande terminer", data);
  //     axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
  //       .then(res => setCommande(res.data.commande));
  //   });

  //   socket.on("livreurStatusChange", ({ id, status }) => {
  //     console.log(`🟢 Livreur ${id} est maintenant ${status}`);
  //   });

  //   socket.on("commandeAnnulee", (data) => {
  //     console.log("❌ Commande annulée", data);
  //     setCommande(null);
  //   });


  //   return () => {
  //     socket.disconnect(); // ✅ Déconnexion propre
  //   };
  // }, []);


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


    socket.on("DeliveryValider", (data) => {
    console.log("✅ DeliveryValider", data);
    axios.get('http://localhost:3000/api/delivery/deliLivreur', { withCredentials: true })
      .then(res => setCommande(res.data.delivery));
  });

  socket.on("livreurStatusChange", ({ id, status }) => {
    console.log(`🟢 Livreur ${id} est maintenant ${status}`);
  });

  socket.on("commandeAnnulee", (data) => {
    console.log("❌ Commande annulée", data);
    setCommande(null);
  });

  return () => {
    socket.disconnect(); // ✅ Déconnexion propre
  };
}, [navigate]);





  // Icônes personnalisées
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


  // Mise à jour position GPS chaque 5 secondes
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
          axios.post('http://localhost:3000/api/commande/updatePosition', {
            latitude_li: coords.latitude,
            longitude_li: coords.longitude
          }, { withCredentials: true }).catch(console.error);
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

  // Initialiser la carte une fois
useEffect(() => {
  if (!mapRef.current && position) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return; // 🛑 Sécurité pour éviter l'erreur

    const map = L.map('map').setView([position.latitude, position.longitude], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    mapRef.current = map;
  }
}, [position]);


  // Afficher itinéraire + icônes
  useEffect(() => {
    if (!commande || commande.statut !== 1 || commande.statut_2 !== 1 || commande.statut_3 !== 0 || !position || !mapRef.current) return;

    const start = L.latLng(position.latitude, position.longitude);
    const end = L.latLng(commande.latitude, commande.longitude);

    // Init routing
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
        setDistanceRestante((route.summary.totalDistance / 1000).toFixed(2));
      });

      if (!startTime) setStartTime(Date.now());
    } else {
      routingControlRef.current.setWaypoints([start, end]);
    }

    // Marqueur livreur
    if (!livreurMarkerRef.current) {
      livreurMarkerRef.current = L.marker(start, { icon: livreurIcon }).addTo(mapRef.current).bindPopup("📦 Livreur");
    } else {
      livreurMarkerRef.current.setLatLng(start);
    }

    // Marqueur client (fixe)
    if (!mapRef.current._clientMarker) {
      const clientMarker = L.marker(end, { icon: clientIcon }).addTo(mapRef.current).bindPopup("🧍‍♂️ Client");
      mapRef.current._clientMarker = clientMarker;
    }

    // Centrer sur livreur
    mapRef.current.setView(start);
  }, [commande, position, startTime]);


  const getElapsedTime = () => {
    if (!startTime) return '00:00';
    const diff = Date.now() - startTime;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  //PingServer
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (socketRef.current) {
  //       socketRef.current.emit('pingServeur');
  //     }
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, []);

  //Effet de chargement de montant
    const handleTypeChange = (e) => {
    const selected = e.target.value;
    setType(selected);

    if (selected === "Cours") {
      setPaie("500 - 3000 FCFA");
    } else if (selected === "Livraison") {
      setPaie("1000 - 2000 FCFA");
    } else if (selected === "Personnalise") {
      setPaie("1500 FCFA — 2500 FCFA");
    } else {
      setPaie("En attente du type");
    }
  };






  if (!livreur) return null;

  return (
    <>
      <div className="mes-barre">
        <Header livreur={livreur} />
      </div>

      <div className="main-content" id="continer">
        {gpsError && (
          <div style={{ color: 'red', fontWeight: 'bold' }}>🚨 Veuillez activer votre GPS</div>
        )}

        <div className="dashboard-livreur">
          

          {!commande || commande.statut_3 === 1 || commande.passation ==='Fini' || delivery.confirmation === 'fini' ? (
  <>
    
    <div className="alert alert-secondary">
      <h2>Bonjour {livreur.nom}</h2><br /><br />

      Aucune demande de livraison en cours
      
    </div>
  </>
) : commande.statut === 1 && commande.statut_2 === 0 && commande.statut_3 === 0 ? (
            <>
              <table className="table table-striped">
                <thead>
                  <tr><th>Client</th><th>Numéro</th><th>Date</th><th>Accepter</th><th>Annuler</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{commande.client_nom}</td>
                    <td>{commande.client_num}</td>
                    <td>{new Date(commande.date_commande).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
  axios.post(`http://localhost:3000/api/commande/confirmer/${commande.id}`, {
    latitude_li: position?.latitude,
    longitude_li: position?.longitude
  }, { withCredentials: true })
    .then(() => {
      axios.get('http://localhost:3000/api/commande/livreurAccueil', { withCredentials: true })
        .then(res => setCommande(res.data.commande));
    })
    .catch(console.error);
}}

                      >
                        Accepter
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm('Annuler la commande ?')) {
                            axios.post(`http://localhost:3000/api/commande/annuler_li/${commande.id}`, {
                              statut: 1,
                              statut_: 1,
                              statut_3: 1,
                              disponibilite: 1
                            }, { withCredentials: true })
                              .then(() => {
        setCommande(null); // ou refetch si besoin
      })
      .catch(err => alert("Erreur d'annulation"));
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
                <p>📦 En attente de validation...</p>
              </div>
            </>
          ) : commande.statut === 1 && commande.statut_2 === 1 && commande.statut_3 === 0 ? (
            <>
              <h4>Livraison en cours</h4>
              <div id="map" style={{ height: '400px', width: '100%' }}></div>
              <p className="mt-3">
                📏 Distance restante : <strong>{distanceRestante ? `${distanceRestante} km` : 'Calcul...'}</strong><br />
                ⏱ Temps écoulé : <strong>{getElapsedTime()}</strong>
              </p>
              <button
                type="button"
                className="btn btn-danger btn-sm mt-2"
                onClick={() => {
                  if (window.confirm("Annuler la commande ?")) {
                    axios.post(`http://localhost:3000/api/commande/annuler_li/${commande.id}`, {
                      statut: 1,
                      statut_1: 1,
                      statut_3: 1,
                      disponibilite: 0
                    }, { withCredentials: true })
                      .then(() => {
        setCommande(null); // ou refetch si besoin
      })
      .catch(err => alert("Erreur d'annulation"));
                  }
                }}
              >
                Annuler
              </button>
<button
  type="button"
  className="btn btn-danger btn-sm mt-2"
  onClick={() => {
    if (window.confirm("Êtes vous face au client ?")) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            // ✅ 1. Envoi du "formulaire invisible" AVANT le changement de statut
            const payload = {
              client_id: commande.client_id,
              livreur_id: livreur.id,
              commande_id: commande.id,
              choix: "Livraison",
              prix: "1000Fcfa",
              confirm_client: "En attente",
              confirm_livreur: "Enclencher",
              confirmation: "Patience",
              actif: 1
            };

            await axios.post(
              "http://localhost:3000/api/delivery/deliLivreur",
              payload,
              { withCredentials: true }
            );

            // ✅ 2. Mise à jour des statuts APRÈS
            await axios.post(
              `http://localhost:3000/api/commande/terminer/${commande.id}`,
              {
                statut: 2,
                statut_2: 2,
                statut_3: 2,
                passation: "Engager",
              },
              { withCredentials: true }
            );

            // ✅ 3. Redirection
            setCommande(null);
            window.location.href = "/livreur/pages/Dashboard";

          } catch (err) {
            console.error("Erreur lors de la finalisation de la commande", err);
            alert("Une erreur est survenue.");
          }
        },
        (err) => {
          alert("⛔ GPS non autorisé. Impossible de continuer.");
        }
      );
    }
  }}
>
  Terminer
</button>


            </>
          ) : null}


  {/* ✅ Bloc "Delivery Initiale Livreur" */}
  {commande && delivery && delivery.confirm_livreur === 'Enclencher' && delivery.confirm_client === 'En attente' && commande.passation ==='Engager' ? (
    <div className="alert alert-warning jikoko">
                <h1>Facturation</h1>
                <form  method="post" id="Envoie-djai">
                  <div className="djai">
                     <span>Le client doit payer entre {paie}</span>
                    <div className="details">
                      <div className="uno">
                        <div className="Perligne">
                          <label htmlFor="nomComplet">
                            Nom du client
                          </label>
                          <span>{commande.client_nom}</span>
                        </div>
                        <div className="Deligne">
                          <label htmlFor="nomComplet"> Contact du client</label>
                          <span>{commande.client_num}</span>
                        </div>
                      </div>
                      <div className="deuxio">
                        <div className="type">
                          <label htmlFor="">Demande</label>
                          <select
                            id="type"
                            value={type}
                            onChange={handleTypeChange}
                            required
                          >
                            <option value="">-- Sélectionnez --</option>
                            <option value="Cours">Cours</option>
                            <option value="Livraison">Livraison</option>
                            <option value="Personnalise">Personnalisé</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="hyuj">
                      <button onClick={async (e) => {
  e.preventDefault();

  try {
    const data = {
      choix: type,
      prix: paie,
    };

     await axios.post(`http://localhost:3000/api/delivery/delilivreur/${delivery.id}`, data); // ✅


    alert("Facturation enregistrée avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'envoi de la facturation :", error);
    alert("Erreur lors de l'envoi");
  }
}}>Valider</button>

{/* Zonne de bouton annuler------------------------------------------------------------------------------------------------------------------------------------------------- */}

<button
  type="button"
  className="btn btn-danger btn-sm mt-2"
  onClick={() => {
    if (window.confirm("Êtes vous face au client ?")) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const payload = {
              actif: 0
            };

             axios.post(
              `http://localhost:3000/api/delivery/annulerLivreur/${delivery.id}`,
              payload,
              { withCredentials: true }
            );


            await axios.post(`http://localhost:3000/api/commande/annuler_li/${commande.id}`, {
                      statut: 1,
                      statut_1: 1,
                      statut_3: 1,
                      disponibilite: 1
                    },
              { withCredentials: true }
            );

            setCommande(null);
            window.location.href = "/livreur/pages/Dashboard";

          } catch (err) {
            console.error("Erreur lors de la finalisation de la commande", err);
            alert("Une erreur est survenue.");
          }
        },
        (err) => {
          alert("⛔ GPS non autorisé. Impossible de continuer.");
        }
      );
    }
  }}
>
  Annuler
</button>

{/* Zonne de bouton annuler------------------------------------------------------------------------------------------------------------------------------------------------- */}

                    </div>
                  </div>
                </form>
              </div>
  ) : null}



  {/* ✅ Bloc "Delivery En attente client" */}
  {commande && delivery && delivery.confirm_livreur === 'Valider' && delivery.confirm_client === 'En attente' && commande.passation ==='Engager' ? (
    <div className="alert alert-warning jikoko">
                <h1>En attente de la validation du client</h1>
                
              </div>
  ) : null}

  {/* ✅ Bloc "Delivery Confirmation de Depart" */}
  {commande && delivery && delivery.confirm_livreur === 'Valider' && delivery.confirm_client === 'Valider' && commande.passation ==='Engager' ? (
    <div className="alert alert-warning jikoko">
                <h1>On demarre </h1>
<button
  type="button"
  className="btn btn-danger btn-sm mt-2"
  onClick={() => {
    if (window.confirm("Vous avez terminer ?")) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            // ✅ 1. Envoi du "formulaire invisible" AVANT le changement de statut
            const payload = {
              confirmation: "Fini",
              actif: 0
            };

            await axios.post(
              `http://localhost:3000/api/delivery/delilivreurTerminerpopo/${delivery.id}`,
              payload,
              { withCredentials: true }
            );

            // ✅ 2. Mise à jour des statuts APRÈS
            await axios.post(
              `http://localhost:3000/api/commande/fini/${commande.id}`,
              {
                disponibilite: 1,
                passation: "Fini",
                actif: 0
              },
              { withCredentials: true }
            );

            // ✅ 3. Redirection
            setCommande(null);
            window.location.href = "/livreur/pages/Dashboard";

          } catch (err) {
            console.error("Erreur lors de la finalisation de la commande", err);
            alert("Une erreur est survenue.");
          }
        },
        (err) => {
          alert("⛔ GPS non autorisé. Impossible de continuer.");
        }
      );
    }
  }}
>
  Terminer
</button>
 
{/* Zonne de bouton annuler------------------------------------------------------------------------------------------------------------------------------------------------- */}

<button
  type="button"
  className="btn btn-danger btn-sm mt-2"
  onClick={() => {
    if (window.confirm("Êtes vous face au client ?")) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const payload = {
              actif: 0
            };

             axios.post(
              `http://localhost:3000/api/delivery/annulerLivreur/${delivery.id}`,
              payload,
              { withCredentials: true }
            );


            await axios.post(`http://localhost:3000/api/commande/annuler_li/${commande.id}`, {
                      statut: 1,
                      statut_1: 1,
                      statut_3: 1,
                      disponibilite: 1
                    },
              { withCredentials: true }
            );

            setCommande(null);
            window.location.href = "/livreur/pages/Dashboard";

          } catch (err) {
            console.error("Erreur lors de la finalisation de la commande", err);
            alert("Une erreur est survenue.");
          }
        },
        (err) => {
          alert("⛔ GPS non autorisé. Impossible de continuer.");
        }
      );
    }
  }}
>
  Annuler
</button>

{/* Zonne de bouton annuler------------------------------------------------------------------------------------------------------------------------------------------------- */}                
              </div>
  ) : null}


        </div>
      </div>
    </>
  );
};





  {/* Debug - Pour vérifier les données si besoin */}
  {/* <pre>{JSON.stringify(commande, null, 2)}</pre>
  <pre>{JSON.stringify(delivery, null, 2)}</pre> */}



export default Dashboard;
