import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Accueil_all.css';

const Accueil = () => {
  return (
    <div className='acc-all'>
      <div className='acc-header'>
        <h1></h1>

        <div className='insc-conn'>
          <div>
            <Link to="/inscrip">Inscription</Link>
          </div>
          <div className='ptitebarre'></div>
          <div>
            <Link to="/connect">Connexion</Link>
          </div>
        </div>
      </div>
      <div className="acc-secondo">
        <div className="motivation">
          <h3> <span>D</span>abou <span>Livraison</span> Express</h3>
          <p> Est une entreprise dynamique spécialisée dans la livraison rapide <br />et sécurisée de colis, documents et marchandises. Basée au cœur <br />de la ville de Dabou, nous mettons un point d’honneur à offrir <br />un service fiable et adapté aux besoins de nos clients.</p>
        </div>
        <img src="/assets/img/thygujlokdded.png" alt="cecec" srcset="" />
      </div>
      <div className="acc-parlage">
        <div className="atouts">
          <h3>💡 Nos atouts</h3>
          
          <p>✅ Rapidité d'exécution <br />

✅ Suivi en temps réel <br />

✅ Courtoisie et professionnalisme <br />

✅ Livraison dans tout les environs de Dabou  </p>
        </div>
        <div className="mission">
          <h3>🎯 Notre mission</h3>
          <p>Simplifier le quotidien des particuliers <br /> et des entreprises de Dabou  en assurant des <br /> livraisons efficaces, avec un excellent rapport qualité-prix.</p>
        </div>
        <div className="paiement">
          <h3> Paiement a la livraison</h3>
          <p> 📱 Paiement mobile   <br /> 💰 Paiement en espèces </p>
        </div>
        <div className="nos-services">
          <h3>📦 Nos services</h3>
          <span>Livraison express colis et de documents  </span><br />
          <span>Courses et achats à domicile</span> <br />
          <span>Livraison pour restaurants, boutiques, commerces locaux</span> <br />
          <span>Services personnalisés sur demande</span>

        </div>
      </div>
      <div className="footer">
        <h2>Faites confiance à Dabou Livraison Express – La rapidité au service de votre tranquillité.</h2>
        <div className="fotern">
            <div className="cont">
            📞 Contactez-nous au : <br /> 0708932255 /0102305412 
          </div>
          <div className="lieu-fo-acc">
            📍 Basé à Dabou, Côte d'Ivoire
          </div>
          <div className="emai-acc-fo">
            📩 Email : <br /> kratos0230x@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
