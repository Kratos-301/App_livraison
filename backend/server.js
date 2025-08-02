require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const compression = require('compression');
const mysql = require('mysql2');
const http = require('http');
const { Server } = require('socket.io');

const commandeController = require('./controllers/commandeController');
const deliveryController = require('./controllers/deliveryController');
const handleSocket = require('./socket/socket');

const app = express();
const server = http.createServer(app);

// ⚠️ Initialise d'abord io AVANT de l'utiliser
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 👇 Tu peux maintenant utiliser io
commandeController.setSocketIo(io);
deliveryController.setSocketIo(io);
handleSocket(io);

io.on('connection', (socket) => {
  console.log('📡 Un client est connecté');
});

// Middleware compression
app.use(compression());

// CORS
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// Middlewares Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: 'votre_clé_secrète',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

app.use((req, res, next) => {
  res.locals.client = req.session.client || null;
  res.locals.livreur = req.session.livreur || null;
  res.locals.isClientAuthenticated = !!req.session.client;
  res.locals.isLivreurAuthenticated = !!req.session.livreur;
  next();
});





// Connexion MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});






db.connect(err => {
  if (err) throw err;
  console.log('✅ Connecté à MySQL');
});

// Mettre les livreurs offline au démarrage
db.query('UPDATE livreuruser SET isOnline = 0', err => {
  if (err) console.error('Erreur réinitialisation online:', err);
  else console.log('🔁 Tous les livreurs remis hors ligne');
});

db.query('UPDATE clientuser SET isOnline = 0', err => {
  if (err) console.error('Erreur réinitialisation online:', err);
  else console.log('🔁 Tous les clients remis hors ligne');
});


app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur Express');
});


// Routes
const clientAuthRouter = require('./routes/clientAuth');
const commandeRoutes = require('./routes/commande');
const livreurAuthRoutes = require('./routes/livreurAuth');
const deliveryRoutes = require('./routes/delivery')


app.use('/api/delivery', deliveryRoutes);
app.use('/api/clientAuth', clientAuthRouter);
app.use('/api/livreur', commandeRoutes);
app.use('/api/commande', commandeRoutes);
app.use('/livreurAuth', livreurAuthRoutes);



const clientLogoutRoute = require('./routes/clientlogout');
app.use('/api/client', clientLogoutRoute);

const livreurLogoutRoute = require('./routes/livreurlogout');
app.use('/api/livreur', livreurLogoutRoute);




// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));



app.use((req, res, next) => {
  console.log(`❌ Route non trouvée : ${req.method} ${req.originalUrl}`);
  next();
});


// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
