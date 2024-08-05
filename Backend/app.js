const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./connection/database');
const tableRoutes = require('./routes/table');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/home', (req, res, next) => {
    res.send('Welcome');
});

app.use('/', tableRoutes);
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

sequelize
.sync()
.then()
.catch(err => console.log(err));

app.listen(3000);
