const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config({path: './config.env'}); // load environment variables from.env file

const port = process.env.PORT || 3000; // use environment variable PORT or default 3000

const app = require('./index');

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.options("*", cors()); // Permette tutte le richieste preflight

// ✅ Enable CORS for all origins
app.use(cors({
  origin: "http://localhost:8080", // Allow frontend to access backend
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // Allow cookies if needed
}));

// Connect to the database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// ✅ Imposta CORS per il frontend su Vite (localhost:5173)
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,  // Se necessario per autenticazione
}));

// ✅ Risponde manualmente alle preflight OPTIONS request
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    console.log("🔥 Headers inviati:", res.getHeaders());
    next();
});

//app.use(express.json());

mongoose.connect(DB, {
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Connection Error:', err));

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});