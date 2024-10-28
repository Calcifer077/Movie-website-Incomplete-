const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// 'dotenv' is basically used to get info from config file.
// In the below line we are telling it where 'config' file is located.
dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database connection successfull!'));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`App running on ${port}`);
});
