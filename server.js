const express = require("express");
const mongoose = require("mongoose");
const logger = require("./middlewares/logger");
const cors = require('cors');
const path = require('path');

const PORT = 5050;

require("dotenv").config();

const app = express();

//requires delle routes
const postsRoute = require("./routes/posts");
const authorsRoute = require("./routes/authors");
const loginRoute = require('./routes/login');
const githubRoute = require('./routes/githubRoute');

app.use('./uploads', express.static(path.join(__dirname, "./uploads")));
app.use(cors());

//middleware
app.use(express.json());
app.use(logger);

// import routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", authorsRoute);
app.use("/", postsRoute);
app.use("/", loginRoute );
app.use("/", githubRoute);

mongoose.connect(process.env.MONGO_DB_URL);



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Server connection error!'))
db.once('open', () => {
    console.log('Database MongoDB connected!');
});

//ultima riga
app.listen(PORT, () =>
    console.log(`Server started and listening on PORT ${PORT}`)
);

