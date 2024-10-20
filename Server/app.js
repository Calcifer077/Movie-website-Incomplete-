const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const movieRouter = require('./routes/movieRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
// const viewRouter = require('./routes/viewRoutes');

// It will basically add various methods of express to our app.
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '/public')));

app.use(cors());

// Below two middlewares are used to read 'req.body'
app.use(
  express.json({
    limit: '10kb',
  }),
);

// This one is specially made for HTML forms.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Below middleware is used to parse the data from the cookie
app.use(cookieParser());

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/movies', movieRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
