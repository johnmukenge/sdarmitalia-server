const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // load environment variables from.env file

const port = process.env.PORT || 3000; // use environment variable PORT or default 3000

const app = require('./index');

// Connect to the database
const DB = process.env.MONGODB_URI;

// ✅ Imposta CORS per il frontend su Vite (localhost:5173)
// ✅ Risponde manualmente alle preflight OPTIONS request

mongoose
  .connect(DB, {})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ DB Connection Error:', err));

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
