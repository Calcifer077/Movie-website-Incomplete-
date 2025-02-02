const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

// When connecting to ATLAS
// const DB = process.env.DATABASE_ATLAS.replace(
//   '<db_password>',
//   process.env.DATABASE_PASSWORD_ATLAS,
// );

// mongoose.connect(DB).then(() => console.log('DB connection successfull'));

// When connecting locally
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
