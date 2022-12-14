const express = require("express");
const demandsRoutes = require("./api/routes/demands");
const usersRoutes = require("./api/routes/users");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const morgan = require("morgan");
var cors = require('cors');

require('dotenv').config();

let DB_NAME = "demands2020";
DB_URL = process.env.DB_HOST + "/" + DB_NAME + "?retryWrites=true&w=majority"

mongoose.connect(
    DB_URL,
    { useNewUrlParser: true }
);
// "mongodb+srv://user:password1234@geopro-clients.rtnt5.mongodb.net/<dbname>?retryWrites=true&w=majority",

const app = express();

app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use((req, res, next) => {
    // all clients have acces to this rest api
    // res.header("Acces-Control-Allow-Origin", "hhtp://localhost:4040")
    res.header("Access-Control-Allow-Origin", "*")
    // headers requests configurations
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Acces-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Acces-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    if (req.method === "OPTIONS"){
        res.header('Acces-Control-Allow-Methods', 'PATCH', 'GET, POST, PUT, DELETE, OPTIONS');
        return res.status(200).json({});
    }
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // res.header('Access-Control-Allow-Credentials', true);
    next();
})

app.use("/users", usersRoutes);
app.use("/demands", demandsRoutes);

app.listen(3000);