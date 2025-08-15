//========= Parametre.jsx============

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

const Parametre = () => {

    const navigate = useNavigate();
    const [client, setUser] = useState(null);
    const [commandes, setCommandes] = useState([]);
    const [deliverys, setDeliverys] = useState([]);









  //--- Chargeur des données depuis la BD ---//

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

//------------------------------------//


  return (
    <>
      <div className="mes-barre">
        <Header client={client} />
      </div>

      

<div className="main-content client" id="continer">
    <h1>Parametre {client?.nom} </h1>
                <div className="all-form djolo">
      <div className="lpm">
        <form className='lploki'>
          <div className="tgh">

            <div className="meute">
              <div className="btn1">
                <label htmlFor="livreur-nom">Nom Complet</label>
                <i className="bi bi-person-fill"></i>
                <input
                  type="text"
                  name="nom"
                  id="livreur-nom"
                  value={client?.nom}
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
                  value={client?.telephone}
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
                  
                  value={client?.lati}
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
                  value={client?.longi}
                  readOnly
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
</div>

    </>
  );
};

export default Parametre;
