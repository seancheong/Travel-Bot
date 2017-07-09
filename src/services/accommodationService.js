import mongoose from 'mongoose';
import axios from 'axios';

import { User } from '../models/user';
import { close, elicitSlot } from '../lexResponses';
import {
  connectDB,
  closeDB,
  buildUrl,
  buildResponseCard,
  formatAddress
} from '../helper';

const HOTELS_SIZE = 5;

const GREETING_INTENT = 'TravelBotGreeting';
const GREETING_SLOTS = { service: null };

const AIRBNB_BASE_URL = 'https://api.airbnb.com/v2';
const AIRBNB_SEARCH_URL = '/search_results';
const AIRBNB_REVIEWS_URL = '/reviews';

const GEO_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const TableName = 'travelbot';

const getReview = async (userId, sessionAttributes, intentRequest, slots, callback) => {
  console.log('getting reviews');

  console.log('finding user');
  let user = await User.findOne({ userId });
  console.log(`${JSON.stringify(user)}`);
  const { result: { hotelIndex, hotels } } = user;

  const airbnbParams = {
    client_id: process.env.AIRBNB_ID,
    _limit: 3,
    role: 'all',
    listing_id: hotels[hotelIndex].id
  };

  const airbnbUrl = buildUrl(`${AIRBNB_BASE_URL}${AIRBNB_REVIEWS_URL}`, airbnbParams);
  let airbnbResponse = await axios.get(airbnbUrl);
  console.log(`reviews: ${JSON.stringify(airbnbResponse.data)}`);

  let reviews = [];

  airbnbResponse.data.reviews.forEach(({ author: { first_name }, comments }) => {
    const review = { first_name, comments };
    reviews.push(review);
  });

  let text = 'TOP 3 REVIEWS: ';
  reviews.forEach(({ first_name, comments }) => {
    text += `

      user: ${first_name}
      ${comments}
    `;
  });
  console.log(`text: ${text}`);

  let responseCard;
  if (hotelIndex === 0) {
    responseCard = buildResponseCard(
      `Do you want to book this for ${hotels[hotelIndex].currency}${hotels[hotelIndex].price} per night?`,
      'Please choose an option',
      hotels[hotelIndex].picture,
      [
        { text: 'Yes', value: 'book' },
        { text: 'Show Next Hotel', value: 'next' }
      ]
    );
  } else {
    responseCard = buildResponseCard(
      `Do you want to book this for ${hotels[hotelIndex].currency}${hotels[hotelIndex].price} per night?`,
      'Please choose an option',
      hotels[hotelIndex].picture,
      [
        { text: 'Yes', value: 'book' },
        { text: 'Show Previous Hotel', value: 'prev' },
        { text: 'Show Next Hotel', value: 'next' }
      ]
    );
  }

  console.log(`responseCard created: ${JSON.stringify(responseCard)}`);
  // closeDB();

  callback(elicitSlot(
    sessionAttributes,
    intentRequest.currentIntent.name,
    slots,
    'hotelResponse',
    text,
    responseCard
  ));
};

const bookHotel = async (userId, sessionAttributes, intentRequest, slots, callback) => {
  console.log('booking hotel');

  const { currentIntent: { slots: { date, days, place, flightId } } } = intentRequest;
  console.log(date + days + place);

  console.log('finding user');
  let user = await User.findOne({ userId });
  console.log(`${JSON.stringify(user)}`);
  const { result: { hotelIndex, hotels } } = user;

  if (!date) {
    console.log('no date has been entered');
    // closeDB();

    callback(elicitSlot(
      sessionAttributes,
      intentRequest.currentIntent.name,
      slots,
      'date',
      `What date would you like to book this for your ${hotels[hotelIndex].city} trip? (enter in DATE MONTH YEAR format, e.g. 18 Jul 2017)'`,
      null
    ));
  } else if (!days) {
    console.log('no date has been entered');
    // closeDB();

    callback(elicitSlot(
      sessionAttributes,
      intentRequest.currentIntent.name,
      slots,
      'days',
      'How many days would you like to book?',
      null
    ));
  } else if (user.userId) {
    if (user.trips.length === 0) {
      console.log('no trips yet for user');

      const trip = { date, days, place, hotel: hotels[hotelIndex] };
      console.log(`adding trip to user: ${userId}`);
      await user.update({ trips: [trip] });
      // closeDB();

      callback(close(
        sessionAttributes,
        `I have booked ${hotels[hotelIndex].name} for ${days} days`
      ));
    } else {
      console.log('adding new trip');

      const trip = { date, days, place, hotel: hotels[hotelIndex] };
      let trips = user.trips;
      trips.push(trip);

      console.log(`adding trip to user: ${userId}`);
      await user.update({ trips });
      // closeDB();

      const responseCard = buildResponseCard(
        'How may I help you now?',
        'Please choose an option',
        null,
        [
          { text: 'Check Trips', value: 'checkTrips' },
          { text: 'Book Hotel', value: 'bookHotel' },
          { text: 'Bye', value: 'bye' }
        ]
      );

      callback(elicitSlot(
        sessionAttributes,
        GREETING_INTENT,
        GREETING_SLOTS,
        'service',
        `I have booked ${hotels[hotelIndex].name} for ${days} days`,
        responseCard
      ));
    }
  } else {
    callback(null, `not able to find user: ${userId}`);
  }
};

const searchHotel = async (userId, address, sessionAttributes, intentRequest, slots, callback) => {
  try {
    const hotels = [];

    const geoParams = {
      address,
      key: process.env.GEOCODING_API_KEY
    };

    const geoUrl = buildUrl(GEO_URL, geoParams);
    let geoResponse = await axios.get(geoUrl);
    console.log(`geoResponse: ${JSON.stringify(geoResponse.data)}`);

    const { formatted_address } = geoResponse.data.results[0];

    const airbnbParams = {
      client_id: process.env.AIRBNB_ID,
      _limit: 5,
      location: formatted_address.replace(/ /g, '')
    };

    const airbnbUrl = buildUrl(`${AIRBNB_BASE_URL}${AIRBNB_SEARCH_URL}`, airbnbParams);
    let airbnbResponse = await axios.get(airbnbUrl);

    airbnbResponse.data.search_results.forEach(({ listing, pricing_quote }) => {
      const { id, name, neighborhood, city, picture_url } = listing;
      const { localized_currency, localized_nightly_price } = pricing_quote;

      const hotel = {
        id,
        name,
        neighborhood,
        city,
        picture: picture_url,
        currency: localized_currency,
        price: localized_nightly_price
      };

      hotels.push(hotel);
    });

    const hotelResult = {
      hotelIndex: 0,
      hotels
    };

    console.log(`hotelResult: ${JSON.stringify(hotelResult)}`);

    let users = await User.find({ userId });
    console.log(`users: ${users}`);

    if (users.length > 0) {
      console.log('updating user');
      let user = users[0];
      await user.update({ result: hotelResult });
    } else {
      console.log('creating new user');
      let user = new User({ userId, result: hotelResult });
      await user.save();
    }

    console.log('user create/update completed');

    console.log('finish searching');
    // closeDB();

    let responseCard = buildResponseCard(
      `Do you want to book this for ${hotels[hotelResult.hotelIndex].currency}${hotels[hotelResult.hotelIndex].price} per night?`,
      'Please choose an option',
      hotels[hotelResult.hotelIndex].picture,
      [
        { text: 'Yes', value: 'book' },
        { text: 'View Reviews', value: 'review' },
        { text: 'Show Next Hotel', value: 'next' }
      ]
    );

    console.log(`responseCard created: ${JSON.stringify(responseCard)}`);

    callback(elicitSlot(
      sessionAttributes,
      intentRequest.currentIntent.name,
      slots,
      'hotelResponse',
      hotels[hotelResult.hotelIndex].name,
      responseCard
    ));
  } catch (e) {
    console.error('errors caught');
    console.error(JSON.stringify(e));
    callback(null, e);
  }
};

const switchHotel = async (params, isNext, callback) => {
  const { userId, sessionAttributes, intentRequest, slots } = params;

  const increment = isNext ? 1 : -1;

  await User.update({ userId }, { $inc: { 'result.hotelIndex': increment } });
  let users = await User.find({ userId });

  if (users.length > 0) {
    let user = users[0];

    console.log(`updated user: ${JSON.stringify(user)}`);
    let { result: { hotelIndex, hotels } } = user;

    hotelIndex %= HOTELS_SIZE;
    let responseCard;

    if (hotelIndex === 0) {
      responseCard = buildResponseCard(
        `Do you want to book this for ${hotels[hotelIndex].currency}${hotels[hotelIndex].price} per night?`,
        'Please choose an option',
        hotels[hotelIndex].picture,
        [
          { text: 'Yes', value: 'book' },
          { text: 'View Reviews', value: 'review' },
          { text: 'Show Next Hotel', value: 'next' }
        ]
      );
    } else {
      responseCard = buildResponseCard(
        `Do you want to book this for ${hotels[hotelIndex].currency}${hotels[hotelIndex].price} per night?`,
        'Please choose an option',
        hotels[hotelIndex].picture,
        [
          { text: 'Yes', value: 'book' },
          { text: 'View Reviews', value: 'review' },
          { text: 'Show Previous Hotel', value: 'prev' },
          { text: 'Show Next Hotel', value: 'next' }
        ]
      );
    }

    // closeDB();

    callback(elicitSlot(
      sessionAttributes,
      intentRequest.currentIntent.name,
      slots,
      'hotelResponse',
      hotels[hotelIndex].name,
      responseCard
    ));
  } else {
    callback(null, `could not get user: ${userId}`);
  }
};

const prevHotel = async (userId, sessionAttributes, intentRequest, slots, callback) => {
  console.log('switching to previous hotel');

  const params = { userId, sessionAttributes, intentRequest, slots };
  switchHotel(params, false, callback);
};

const nextHotel = async (userId, sessionAttributes, intentRequest, slots, callback) => {
  console.log('switching to next hotel');

  const params = { userId, sessionAttributes, intentRequest, slots };
  switchHotel(params, true, callback);
};

export const accommodationService = async (intentRequest, callback) => {
  const { userId, sessionAttributes, currentIntent: { slots }, inputTranscript } = intentRequest;

  console.log(`slots: ${JSON.stringify(slots)}`);
  console.log(`inputTranscript: ${inputTranscript}`);

  if (slots.hotelResponse) {
    switch (slots.hotelResponse) {
    case 'next':
      nextHotel(userId, sessionAttributes, intentRequest, slots, callback);
      break;
    case 'prev':
      prevHotel(userId, sessionAttributes, intentRequest, slots, callback);
      break;
    case 'review':
      getReview(userId, sessionAttributes, intentRequest, slots, callback);
      break;
    default:
      bookHotel(userId, sessionAttributes, intentRequest, slots, callback);
      return;
    }
  } else if (slots.place) {
    console.log(`searching hotels in: ${slots.place}`);

    let address = formatAddress(slots.place);
    searchHotel(userId, address, sessionAttributes, intentRequest, slots, callback);
  }
};
