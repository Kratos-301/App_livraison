//========= Commande.jsx============

import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Header from "../Header/Header";
import L from "leaflet";
import "leaflet-routing-machine";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import "../styles/barre.css";
import "../styles/attente.css";
import "../styles/accueil.css";

const Commande = () => {

    const navigate = useNavigate();
    const [client, setUser] = useState(null);
    const [commandes, setCommandes] = useState([]);
    const [deliverys, setDeliverys] = useState([]);

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
        setDeliverys(resDelivery.data.deliverys || []); // 👈 Ajout ici
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  useEffect(() => {
  console.log("Commandes reçues :", commandes);
  console.log("Delivery reçu :", deliverys);
}, [commandes, deliverys]);




  return (
    <>
      <div className="mes-barre">
        <Header client={client} />
      </div>

      

<div className="main-content client" id="continer">
    <h1>Commmande</h1>
</div>

    </>
  );
};

export default Commande;
