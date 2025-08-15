//========= Accueil.jsx============

import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Header from "../Header/Header";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import "../styles/barre.css";
import "../styles/attente.css";
import "../styles/accueil.css";

const Accueil = () => {
  const [type, setType] = useState("");
  const [paie, setPaie] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [client, setUser] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [deliverys, setDeliverys] = useState([]);

  const [startTime, setStartTime] = useState(null);
  const [position, setPosition] = useState(null);
  const [gpsError, setGpsError] = useState(false);

  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const livreurMarkerRef = useRef(null);
  const clientMarkerRef = useRef(null);

const [coords, setCoords] = useState(null);
const [distanceMeters, setDistanceMeters] = useState(0);
const [followLivreur, setFollowLivreur] = useState(true);


  const socketRef = useRef(null);
    const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 6.0; // ⚡ 2x plus rapide
    }
  }, []);

  //Websocket

  useEffect(() => {
    // Initialisation socket
    socketRef.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Écouteurs d'événements socket
    socket.on("commandeCreated", (data) => {
      console.log("📦 Nouvelle commande reçue", data);
      axios
        .get("http://localhost:3000/api/commande/accueil", {
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data.client);
          setCommandes(res.data.commandes || []);
          setLivreurs(res.data.livreurs || []);
          setDeliverys(res.data.deliverys || []); // ✅ rafraîchit les livreurs !
        });
    });

    socket.on("commandeConfirmed", (data) => {
      console.log("✅ Commande confirmée", data);
      axios
        .get("http://localhost:3000/api/commande/accueil", {
          withCredentials: true,
        })
        .then((res) => setCommandes(res.data.commandes));
    });

    socket.on("CommandeTerminer", (data) => {
      console.log("✅ Commande terminée", data);
      axios
        .get("http://localhost:3000/api/commande/accueil", {
          withCredentials: true,
        })
        .then((res) => {
          setCommandes(res.data.commandes || []);
          setLivreurs(res.data.livreurs || [] );
        });
    });

     socket.on("deliveryCreated", (data) => {
      console.log("✅ Delivery Creer", data);
      axios
        .get("http://localhost:3000/api/delivery/deliClient", {
          withCredentials: true,
        })
        .then((res) => {
          setDeliverys(res.data.deliverys || []);
        });
    });




     socket.on("commandeConfirmed", (data) => {
      console.log("✅ commandeConfirmed ", data);
      axios
        .get('http://localhost:3000/api/delivery/deliClient', {
          withCredentials: true,
        })
        .then((res) => {
          setLivreurs(res.data.livreurs || []);
          setDeliverys(res.data.deliverys || []);
        });
    });


    socket.on("DeliveryUpdadeTerminer", (data) => {
    console.log("✅ DeliveryUpdadeTerminer", data);
    axios.get('http://localhost:3000/api/delivery/deliClient', { withCredentials: true })
      .then((res) => {
          setDeliverys(res.data.deliverys || []);
          setCommandes(res.data.commandes || []);
          setLivreurs(res.data.livreurs || []);
        });
  });


    socket.on("livreurStatusChange", ({ id, status }) => {
      console.log(`🟢 Livreur ${id} est maintenant ${status}`);
      axios
        .get("http://localhost:3000/api/commande/accueil", {
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data.client);
          setCommandes(res.data.commandes || []);
          setLivreurs(res.data.livreurs || []);
          setDeliverys(res.data.deliverys || []);
        });
    });

        socket.on("disconnect", ({ id, status }) => {
      console.log(`🟢 Livreur ${id} s'est tout a l'heure ${status}`);
      axios
        .get("http://localhost:3000/api/commande/accueil", {
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data.client);
          setCommandes(res.data.commandes || []);
          setLivreurs(res.data.livreurs || []);
          setDeliverys(res.data.deliverys || []);
        });
    });


    socket.on("commandeAnnulee", (data) => {
      console.log("❌ Commande annulée", data);
      axios
        .get("http://localhost:3000/api/commande/accueil", {
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data.client);
          setCommandes(res.data.commandes || []);
          setLivreurs(res.data.livreurs || []);
          setDeliverys(res.data.deliverys || []);
        });
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  // A detruire

  const commandeEnCours = commandes.find(
    (cmd) => cmd.statut === 1 && cmd.statut_2 === 1 && cmd.statut_3 === 0
  );

  // A detruire

  const formVisible = useMemo(() => {
    return !commandes.some(
      (cmd) =>
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
            longitude: pos.coords.longitude,
          };
          setPosition(coords);
          axios
            .post(
              "http://localhost:3000/api/commande/updatePositionCli",
              coords,
              {
                withCredentials: true,
              }
            )
            .catch(console.error);
        },
        (err) => {
          console.warn("GPS error:", err.message);
          setGpsError(true);
        }
      );
    };

    updateGPS();
    const interval = setInterval(updateGPS, 2000);
    return () => clearInterval(interval);
  }, []);


  //Initialisation de l'affichage de la carte
  
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
//         if (!client || !livreur) return;

//         const newCoords = {
//           livreur: { lat: livreur.latitude_li, lng: livreur.longitude_li },
//           client: { lat: client.lati, lng: client.longi },
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



//Formulaire Invisible

  const handleGeoSubmit = (livreur) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          client_id: client.id,
          client_nom: client.nom,
          client_num: client.telephone,
          livreur_id: livreur.id,
          livreur_nom: livreur.nom,
          livreur_marque_moto: livreur.marque_moto,
          latitude: pos.coords.latitude || client.lati,
          longitude: pos.coords.longitude || client.longi,
          statut: "1",
          statut_2: "0",
          statut_3: "0",
          disponibilite: "0",
        };

        try {
          await axios.post(
            "http://localhost:3000/api/commande/accueil",
            payload,
            {
              withCredentials: true,
            }
          );

        } catch (err) {
          console.error("Erreur lors de l’envoi de la commande", err);
        }
      },
      (err) => {
        alert("⛔ GPS non autorisé. Impossible de continuer.");
      }
    );
  };

//Chargeur des données depuis la BD

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:3000/api/commande/accueil", {
        withCredentials: true,
      }),
      axios.get("http://localhost:3000/api/delivery/deliClient", {
        withCredentials: true,
      }),
    ])
      .then(([resAccueil, resDelivery]) => {
        if (!resAccueil.data.client) {
          navigate("/");
          return;
        }

        setUser(resAccueil.data.client);
        setCommandes(resAccueil.data.commandes || []);
        setLivreurs(resAccueil.data.livreurs || []);
        setDeliverys(resDelivery.data.deliverys || []); // 👈 Ajout ici
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  useEffect(() => {
  console.log("Commandes reçues :", commandes);
  console.log("Delivery reçu :", deliverys);
}, [commandes, deliverys]);


// Affichage distance dans la liste livreur
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // rayon Terre en km
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

//------------------//


  if (!client) return null;


  return (
    <>
      <div className="mes-barre">
        <Header client={client} />
      </div>

      

<div className="main-content client" id="continer">
  {(() => {
    // On prépare les conditions importantes pour l'affichage
    const hasCommandeStatut1_0_0 = commandes.some(
      (cmd) => cmd.statut === 1 && cmd.statut_2 === 0 && cmd.statut_3 === 0
    );
    const hasCommandeStatut1_1_0 = commandes.some(
      (cmd) => cmd.statut === 1 && cmd.statut_2 === 1 && cmd.statut_3 === 0
    );
    const hasCommandePassationEngagerStatut222 = commandes.some(
      (cmd) => cmd.statut === 2 && cmd.statut_2 === 2 && cmd.statut_3 === 2 && cmd.passation === "Engager"
    );
    const hasCommandePassationEngager = commandes.some(
      (cmd) => cmd.passation === "Engager"
    );

    
    // Objet regroupant tous les états à utiliser
    const firstDelivery = deliverys[0] || {};

const status = {
  hasCommandeStatut1_0_0,
  hasCommandeStatut1_1_0,
  hasCommandePassationEngagerStatut222,
  hasCommandePassationEngager,
  isDeliveryConfirmLivreurEnclencher: firstDelivery.confirm_livreur === "Enclencher",
  isDeliveryConfirmLivreurValider: firstDelivery.confirm_livreur === "Valider",
  isDeliveryConfirmClientEnAttente: firstDelivery.confirm_client === "En attente",
  isDeliveryConfirmClientValider: firstDelivery.confirm_client === "Valider",
};

    return (
      <>
        {/* Affichage formulaire si aucune commande en attente */}
        {firstDelivery && !(
          status.hasCommandeStatut1_0_0 ||
          status.hasCommandeStatut1_1_0 ||
          status.hasCommandePassationEngagerStatut222
        ) && (
          <>
            {gpsError && (
              <div style={{ color: "red", fontWeight: "bold" }}>
                🚨 Veuillez activer votre GPS
              </div>
            )}
            <h1>Bienvenue {client?.nom || "..."}</h1>
<div className="all-form" id="okjik">
  <div id="zone-livreurs">
    {livreurs.length === 0 ? (
      <div className="alert alert-warning text-center">
        🛑 Aucun livreur n’est actuellement en ligne.
      </div>
    ) : (
      // On crée un tableau enrichi avec distance
      [...livreurs]
        .map((livreur) => {
          const cLat = parseFloat(client?.lati);
          const cLng = parseFloat(client?.longi);
          const lLat = parseFloat(livreur?.latitude_li);
          const lLng = parseFloat(livreur?.longitude_li);

          const distanceKm =
            Number.isFinite(cLat) && Number.isFinite(cLng) &&
            Number.isFinite(lLat) && Number.isFinite(lLng)
              ? haversineKm(cLat, cLng, lLat, lLng)
              : null;

          return { ...livreur, distanceKm };
        })
        // Tri par distance (null à la fin)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        })
        .map((livreur, index) => (
          <div
            key={livreur.id}
            className={`livreur-card ${
              livreur.est_occupe ? "occupe" : "disponible"
            }`}
          >
            <img
              src={`http://localhost:3000/uploads/livreurs/${livreur.pp}`}
              alt={`Profil de ${livreur.nom}`}
            />
            <span className="livreur-nom">{livreur.nom}</span>
            <span>{livreur.marque_moto}</span>

            {/* Distance */}
            <span
              className="distance-livreur"
              id={`loli-${livreur.id}`} // id unique
            >
              {livreur.distanceKm === null
                ? "—"
                : `${livreur.distanceKm.toFixed(2)} km`}
            </span>

            {/* Badge pour le plus proche */}
            {index === 0 && livreur.distanceKm !== null && (
              <span
                style={{
                  background: "gold",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  marginLeft: "6px",
                  fontSize: "0.8em",
                }}
              >
                ⭐ Le plus proche
              </span>
            )}

            <div className="commander">
              {livreur.est_occupe ? (
                <span className="statut" style={{ color: "red" }}>
                  🔴 Occupé
                </span>
              ) : (
                <div className="affiju d-flex">
                  <span className="statut" style={{ color: "green" }}>
                    🟢
                  </span>
                  <input
                    type="button"
                    value="Commander"
                    onClick={() => handleGeoSubmit(livreur)}
                  />
                </div>
              )}
            </div>
          </div>
        ))
    )}
  </div>
</div>

          </>
        )}

        {/* Carte pour commande en cours */}
        {commandes.find(
          (cmd) => cmd.statut === 1 && cmd.statut_2 === 1 && cmd.statut_3 === 0
        ) && (
          <div className="map-container"  >
            <h3>Votre livreur est en cour de route, veillez ne pas trop vous eloignez de votre position actuelle</h3>
            {/* <div id="map" style={{ height: "400px", marginTop: "20px" }}></div> */}
           {/* <p>Distance restante : {(distanceMeters / 1000).toFixed(2)} km</p>
  <button onClick={() => setFollowLivreur(true)}>🔄 Recentrer sur livreur & client</button> */}

<div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        src="/videos/attente-client/attente-client.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: "80%", borderRadius: "10px" }}
      />
    </div>
                <p>
              <button
                className="btn btn-danger btn-sm"
                onClick={async () => {
                  const commande = commandes.find(
                    (cmd) =>
                      cmd.statut === 1 &&
                      cmd.statut_2 === 1 &&
                      cmd.statut_3 === 0
                  );
                  if (!commande) return;

                  try {
                    await axios.post(
                      `http://localhost:3000/api/commande/annuler/${commande.id}`,
                      {},
                      { withCredentials: true }
                    );
                    setCommandes((prev) => prev.filter((c) => c.id !== commande.id));
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

        {/* Liste des commandes en attente validation */}
        {commandes.map((cmd) => {
          if (cmd.statut === 1 && cmd.statut_2 === 0 && cmd.statut_3 === 0) {
            const date = new Date(cmd.date_commande).toLocaleString();
            return (
              <div key={cmd.id}>
                <table className="table table-striped mt-4">
                  <thead>
                    <tr>
                      <th>Livreur</th>
                      <th>Moto</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
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
                            try {
                              await axios.post(
                                `http://localhost:3000/api/commande/annuler/${cmd.id}`,
                                {},
                                { withCredentials: true }
                              );
                              setCommandes((prev) => prev.filter((c) => c.id !== cmd.id));
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

        {/* Bloc "Delivery De Validation de dit Livreur" */}
        {status.isDeliveryConfirmLivreurEnclencher && status.hasCommandePassationEngager && (
          <div className="alert alert-warning jikoko">
            <h1>
              Votre livreur est arrivé <br /> veillez negocier les différents details
            </h1>
            <br />
            <div className="loader-container">
              <div className="loader"></div>
              <p>En attente de fin de négociation avec votre livreur</p>
            </div>
          </div>
        )}

        {/* Bloc De demande de validation Client */}
        {status.isDeliveryConfirmLivreurValider &&
          status.isDeliveryConfirmClientEnAttente &&
          status.hasCommandePassationEngager && (
            (() => {
              const commandeEnCours = commandes.find((cmd) => cmd.passation === "Engager");

              return (
                <div className="alert alert-warning jikoko">
                  <h1>Facturation</h1>
                  <form method="post" id="Envoie-djai">
                    <div className="djai">
                      <span>
                        Vous avez selectionné <strong>{firstDelivery.choix}</strong> ça vous reviens a
                        une sommes comprise entre <strong>{firstDelivery.prix} </strong>selon la distance
                      </span>
                      <br />
                      <br />
                      <div className="details">
                        <div className="uno">
                          <div className="Perligne">
                            <label htmlFor="nomComplet">Identifiant livreur</label>
                            <span>
                              {commandeEnCours ? commandeEnCours.livreur_nom : "Livreur inconnu"}
                            </span>
                          </div>
                          <div className="Deligne">
                            <label htmlFor="nomComplet"> Engin du livreur</label>
                            <span>
                              {commandeEnCours
                                ? commandeEnCours.livreur_marque_moto
                                : "Livreur inconnu"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              const data = {
                                confirm_client: "Valider",
                              };
                              await axios.post(
                                `http://localhost:3000/api/delivery/deliclient/${firstDelivery.id}`,
                                data
                              );
                              alert("Facturation Valider !");
                            } catch (error) {
                              console.error(
                                "Erreur lors de l'envoi de la facturation client :",
                                error.response?.data || error.message || error
                              );
                              alert(
                                "Erreur lors de l'envoi client ",
                                error.response?.data || error.message || error
                              );
                            }
                          }}
                        >
                          Je suis d'accord
                        </button>

                        {/* Bouton annuler */}
                        <button
                          type="button"
                          className="btn btn-danger btn-sm mt-2"
                          onClick={() => {
                            if (window.confirm("Êtes vous De vouloir annuler ?")) {
                              navigator.geolocation.getCurrentPosition(
                                async (pos) => {
                                  try {
                                    const payload = {
                                      actif: 0,
                                    };

                                    await axios.post(
                                      `http://localhost:3000/api/delivery/annulerClient/${firstDelivery.id}`,
                                      payload,
                                      { withCredentials: true }
                                    );

                                    await axios.post(
                                      `http://localhost:3000/api/commande/annuler/${commandeEnCours.id}`,
                                      {
                                        statut: 1,
                                        statut_1: 1,
                                        statut_3: 1,
                                        disponibilite: 1,
                                      },
                                      { withCredentials: true }
                                    );

                                    setCommandes(null);
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
                        {/* Fin bouton annuler */}
                      </div>
                    </div>
                  </form>
                </div>
              );
            })()
          )}

        {/* Bloc De demande de validation Client - confirmation finale */}
        {status.isDeliveryConfirmLivreurValider &&
          status.isDeliveryConfirmClientValider &&
          status.hasCommandePassationEngager && (
            (() => {
              return (
                <div className="alert alert-warning jikoko">
                  <h1>En route</h1>
                </div>
              );
            })()
          )}
      </>
    );
  })()}
</div>

    </>
  );
};

export default Accueil;
