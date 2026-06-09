const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const corsMiddleware = require('./middleware/corsMiddleware'); 
const authRouter = require("./routes/auth");
const songsRouter = require("./routes/songs");
const wordsRouter = require('./routes/words');
const studylogsRouter = require('./routes/studylogs');

dotenv.config();

const app = express()

app.use(corsMiddleware);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/songs", songsRouter);
app.use('/api/words', wordsRouter);
app.use('/api/study-logs', studylogsRouter);

app.get('/', (req, res) => {
    res.send('Backend Server for songvoca project is now runnig!');
});

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;