import mongoose from 'mongoose';
import qs from 'qs';

export const buildUrl = (baseUrl, params) => {
  const query = qs.stringify(params);
  return `${baseUrl}?${query}`;
};

export const buildResponseCard = (title, subTitle, imageUrl, buttons) => {
  return {
    'contentType': 'application/vnd.amazonaws.card.generic',
    'genericAttachments': [
      { title, subTitle, imageUrl, buttons }
    ]
  };
};

export const connectDB = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGO_URL);
  mongoose.connection
      .once('open', () => console.log('Connected to MongoLab instance.'))
      .on('error', error => console.log('Error connecting to MongoLab:', error));
};

export const closeDB = () => {
  mongoose.connection.close();
};

export const formatAddress = place => {
  let formattedPlace = place.replace(/ /g, '+');
  console.log(`formattedPlace: ${formattedPlace}`);

  return formattedPlace;
};

export const getMonthName = month => {
  switch (month) {
  case 0:
    return 'Jan';
  case 1:
    return 'Feb';
  case 2:
    return 'Mac';
  case 3:
    return 'Apr';
  case 4:
    return 'May';
  case 5:
    return 'Jun';
  case 6:
    return 'Jul';
  case 7:
    return 'Aug';
  case 8:
    return 'Sep';
  case 9:
    return 'Oct';
  case 10:
    return 'Nov';
  case 11:
    return 'Dec';
  default:
    return 'Undefined';
  }
};
