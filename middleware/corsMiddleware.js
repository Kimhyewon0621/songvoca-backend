const cors = require('cors');

const corsOptions = { // this is a setting value for making function through cors()
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true,
};

// exports middleware function
module.exports = cors(corsOptions);