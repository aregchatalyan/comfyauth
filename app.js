const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const app = express();

require('./config/database');

const authRoutes = require('./routes/auth');
const forgotRoutes = require('./routes/forgot');
const contactRoutes = require('./routes/contact');
const profileRoutes = require('./routes/profile');
const supportRoutes = require('./routes/support');
const meetingRoutes = require('./routes/meeting');

app.use('/uploads', express.static(`${__dirname}/uploads`));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(passport.initialize());
require('./middleware/passport')(passport);

app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/forgot', forgotRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/meeting', meetingRoutes);

app.use((req, res, next) => {
    res.status(404).redirect('https://rocky-inlet-34170.herokuapp.com/api/auth');
    next();
});

app.disable('x-powered-by');

module.exports = app;
