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


    const clientMarkerRef = useRef(null);
  
  const [coords, setCoords] = useState(null);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [followLivreur, setFollowLivreur] = useState(true);


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

    const map = L.map('map').setView([position.latitude, position.longitude], 12);
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
    // mapRef.current.setView(start);
  }, [commande, position, startTime]);


// useEffect(() => {
//   const livreurIcon = L.icon({
//     iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
//     iconSize: [40, 40],
//     iconAnchor: [20, 40],
//     popupAnchor: [0, -40],
//   });

//   const clientIcon = L.icon({
//     iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
//     iconSize: [40, 40],
//     iconAnchor: [20, 40],
//     popupAnchor: [0, -40],
//   });

//   const interval = setInterval(() => {
//     axios.get("http://localhost:3000/api/commande/accueil", { withCredentials: true })
//       .then((res) => {
//         const client = res.data.client;
//         const livreur = res.data.livreurs?.[0];
//         if (client || !livreur) return;

//         const newCoords = {
//           livreur: { lat: livreur.lat, lng: livreur.long },
//           client: { lat: commande.latitude, lng: commande.longitude },
//         };

//         setCoords(newCoords);

//         // Initialisation carte si nécessaire
//         if (!mapRef.current) {
//           const map = L.map("map").setView([newCoords.livreur.lat, newCoords.livreur.lng], 14);

//           L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//             attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
//           }).addTo(map);

//           // Marqueurs
//           livreurMarkerRef.current = L.marker([newCoords.livreur.lat, newCoords.livreur.lng], { icon: livreurIcon }).addTo(map).bindPopup("Livreur");
//           clientMarkerRef.current = L.marker([newCoords.client.lat, newCoords.client.lng], { icon: clientIcon }).addTo(map).bindPopup("Client");

//           // Routage
//           routingControlRef.current = L.Routing.control({
//             waypoints: [
//               L.latLng(newCoords.livreur.lat, newCoords.livreur.lng),
//               L.latLng(newCoords.client.lat, newCoords.client.lng),
//             ],
//             routeWhileDragging: false,
//             addWaypoints: false,
//             createMarker: () => null,
//             lineOptions: { styles: [{ color: "blue", weight: 5 }] },
//           }).addTo(map);

//           mapRef.current = map;
//         } else {
//           // Animation du marqueur livreur
//           if (livreurMarkerRef.current) {
//             const current = livreurMarkerRef.current.getLatLng();
//             const target = L.latLng(newCoords.livreur.lat, newCoords.livreur.lng);
//             const frames = 10;
//             let i = 0;
//             const deltaLat = (target.lat - current.lat) / frames;
//             const deltaLng = (target.lng - current.lng) / frames;
//             const anim = setInterval(() => {
//               if (i >= frames) clearInterval(anim);
//               else {
//                 livreurMarkerRef.current.setLatLng([current.lat + deltaLat * i, current.lng + deltaLng * i]);
//                 i++;
//               }
//             }, 50);
//           }

//           // Mise à jour client
//           if (clientMarkerRef.current) {
//             clientMarkerRef.current.setLatLng([newCoords.client.lat, newCoords.client.lng]);
//           }

//           // Mise à jour itinéraire
//           if (routingControlRef.current) {
//             routingControlRef.current.setWaypoints([
//               L.latLng(newCoords.livreur.lat, newCoords.livreur.lng),
//               L.latLng(newCoords.client.lat, newCoords.client.lng),
//             ]);

//             // Calcul distance
//             routingControlRef.current.on("routesfound", (e) => {
//               const route = e.routes[0];
//               setDistanceMeters(route.summary.totalDistance);
//             });
//           }

//           // Recentrage si suivi activé
//           if (followLivreur && mapRef.current) {
//             const group = L.featureGroup([livreurMarkerRef.current, clientMarkerRef.current]);
//             mapRef.current.flyToBounds(group.getBounds().pad(0.05));
//           }
//         }

//       })
//       .catch((err) => console.error("Erreur récupération données :", err));
//   }, 3000);

//   return () => clearInterval(interval);
// }, [followLivreur]);



  const getElapsedTime = () => {
    if (!startTime) return '00:00';
    const diff = Date.now() - startTime;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


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
          
         

          {
            !commande && !delivery && livreur.disponibilite !== 'Valider'  ? (
                <>
                  <h1>RDV au centre pour finaliser votre inscription</h1>
  <p>Vous n'êtes pas éligible a la reception de commande </p>
  <p>Les client ne vous veront pas des leurs listes jusqu'a la finalisation de votre inscription</p>
                </>

) :
            

          !commande || commande.statut_3 === 1 || commande.passation ==='Fini' || (delivery && delivery.confirmation === 'fini')? (
  <>
    
    <div className="alert alert-secondary">
      <h2>Bonjour {livreur.nom}</h2><br />

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
              <div id="map" style={{ height: '400px', width: '500px' }}></div>
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
          )
           :  null}


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
