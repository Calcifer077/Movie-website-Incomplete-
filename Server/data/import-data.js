const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/movieModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE_ATLAS.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD_ATLAS,
);

mongoose.connect(DB).then(() => console.log('DB connection successfull'));

const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/movies-test.json`, 'utf-8'),
);

const users = JSON.parse(fs.readFileSync(`${__dirname}/user.json`, 'utf-8'));

// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
// );

const importData = async () => {
  try {
    // await Movie.create(movies, {
    //   validateBeforeSave: false,
    // });

    await User.create(users, {
      validateBeforeSave: false,
    });

    // await Review.create(reviews, {
    //   validateBeforeSave: false,
    // });

    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Movie.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log('Argument passed:', process.argv[2]);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// http://www.omdbapi.com/?i=tt3896198&apikey=3d1173ac

// const movies = [
//   'tt0111161',
//   'tt0068646',
//   'tt0468569',
//   'tt0050083',
//   'tt0108052',
//   'tt0109830',
//   'tt1375666',
//   'tt0137523',
//   'tt3896198',
// ];

// function fetchData() {
//   movies.forEach(async (el) => {
//     const res = await fetch(`
//       http://www.omdbapi.com/?i=${el}&apikey=3d1173ac`);

//     const data = await res.json();
//     console.log(data);

//     const toWrite = JSON.stringify(data);
//     console.log(toWrite);
//     fs.appendFileSync(
//       `${__dirname}/movies-test.json`,
//       `${toWrite},`,
//       'utf-8',
//       function (err) {
//         console.log(err);
//       },
//     );
//   });
// }

// fetchData();

// Always start from the base folder 'server' in this case where package.json resides otherwise dotenv will not be able to read 'config.env' file
