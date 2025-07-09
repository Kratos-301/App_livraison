import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

const CarteCommande = ({ clientLat, clientLon, livreurLat, livreurLon }) => {
  useEffect(() => {
    const map = L.map('map').setView([clientLat, clientLon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.Routing.control({
      waypoints: [
        L.latLng(livreurLat, livreurLon),
        L.latLng(clientLat, clientLon)
      ],
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }]
      },
      createMarker: function () { return null; },
      addWaypoints: false,
      draggableWaypoints: false
    }).addTo(map);

    return () => map.remove();
  }, [clientLat, clientLon, livreurLat, livreurLon]);

  return <div id="map" style={{ height: '400px', margin: '20px 0' }}></div>;
};

export default CarteCommande;
