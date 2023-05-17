'use strict';
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const RunningDb = require('./modules/runningDb');
const CoursesApi = require('./modules/courses/coursesApi.js');
const PlansApi = require('./modules/plans/plansApi.js');
const UsersApi = require('./modules/users/usersApi.js');

const app = new express();
app.use(morgan('dev'));
app.use(express.json());

const PORT = 3001;

const corsOptions = {
    origin: `http://localhost:3000`,
    optionsSuccessStatus: 200,
    credentials: true
}

app.use(cors(corsOptions));
RunningDb.createAll();

UsersApi.useApi(app);
CoursesApi.useApi(app);
PlansApi.useApi(app);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
