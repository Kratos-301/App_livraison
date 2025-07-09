import React, { useEffect, useState } from 'react';

const VerifGPS = () => {
  const [gpsActif, setGpsActif] = useState(true);

  const verifierGPS = () => {
    if (!navigator.geolocation) {
      setGpsActif(false); // Le navigateur ne prend pas en charge la géolocalisation
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setGpsActif(true),     // ✅ GPS disponible
      () => setGpsActif(false),    // ❌ GPS refusé/désactivé
      { timeout: 3000 }            // attends 3s maximum
    );
  };

  useEffect(() => {
    verifierGPS(); // Vérifie une première fois

    // Vérifie toutes les 5 secondes
    const interval = setInterval(verifierGPS, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {!gpsActif && (
        <div id="error-gps" style={{ color: 'red', fontWeight: 'bold', margin: '10px 0' }}>
          ❌ Veuillez activer votre GPS pour utiliser le service.
        </div>
      )}
    </>
  );
};

export default VerifGPS;
