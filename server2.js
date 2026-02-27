// Import the main app from app.js
const app = require('./src/app');

// Define the port our server will run on
const PORT = 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
