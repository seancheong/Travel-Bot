import { close, elicitSlot } from '../lexResponses';
import { buildResponseCard, getMonthName, closeDB } from '../helper';
import { User } from '../models/user';
import { endService, searchHotel } from './greetingService';

const GREETING_INTENT = 'TravelBotGreeting';
const GREETING_SLOTS = { service: null };

const TRIPS_INTENT = 'TravelBotTrips';
const TRIPS_SLOTS = { trip: null, action: null };

const removeSelectedTrip = async (intentRequest, callback) => {
  console.log('removing selected trip');

  const { userId, sessionAttributes, currentIntent: { slots } } = intentRequest;
  const { trip } = slots;

  let user = await User.findOne({ userId });
  const index = user.trips.findIndex(tripItem => tripItem._id.toString() === trip);
  console.log(`index found: ${index}`);

  user.trips.splice(index, 1);
  console.log(`remaining trips: ${JSON.stringify(user.trips)}`);

  let trips = user.trips.slice();
  await user.update({ trips });

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
    'Selected trip has been removed successfully',
    responseCard
  ));
};

const selectTrip = async (intentRequest, callback) => {
  console.log('selecting trip');

  const { userId, sessionAttributes, currentIntent: { slots } } = intentRequest;
  const { trip } = slots;

  let user = await User.findOne({ userId });
  let tripObj = user.trips.find(tripItem => tripItem._id.toString() === trip);

  const { place, days, date, hotel } = tripObj;
  let dateFormat = new Date(date);

  let hotelText = `
    hotel:
      name: ${hotel ? hotel.name : ''}
      neighborhood: ${hotel ? hotel.neighborhood : ''}
      price: ${hotel ? hotel.currency : ''}${hotel ? hotel.price : ''}
  `;

  let text = `
    place: ${place}
    days: ${days}
    date: ${dateFormat.getDate()} ${getMonthName(dateFormat.getMonth())} ${dateFormat.getFullYear()}

    ${hotel ? hotelText : ''}
  `;

  const responseCard = buildResponseCard(
    'How may I help you now?',
    'Please choose an option',
    null,
    [
      { text: 'Remove Selected Trip', value: 'removeTrip' },
      { text: 'Check Trips again', value: 'checkTrips' },
      { text: 'Book Hotel', value: 'bookHotel' },
      { text: 'Bye', value: 'bye' }
    ]
  );

  callback(elicitSlot(
    sessionAttributes,
    TRIPS_INTENT,
    { ...slots, action: null },
    'action',
    text,
    responseCard
  ));
};

export const checkAvailableTrips = async (intentRequest, callback) => {
  console.log('checking available trips');

  const { userId, sessionAttributes, currentIntent: { slots } } = intentRequest;

  let user = await User.findOne({ userId });

  if (user.trips.length === 0) {
    const responseCard = buildResponseCard(
      'Do you want to book a trip now?',
      'Please choose an option',
      null,
      [
        { text: 'Book Hotel', value: 'bookHotel' },
        { text: 'Bye', value: 'bye' }
      ]
    );

    callback(elicitSlot(
      sessionAttributes,
      GREETING_INTENT,
      GREETING_SLOTS,
      'service',
      'No trips have been booked before.',
      responseCard
    ));
  } else {
    console.log(`user trips: ${user.trips}`);
    let text = 'UPCOMING TRIPS: ';
    let buttons = [];

    user.trips.forEach(({ _id, place, days, date }, index) => {
      buttons.push({ text: `Trip ${index + 1}`, value: _id });
      let dateFormat = new Date(date);

      text += `

        trip: ${index + 1}
        place: ${place}
        days: ${days}
        date: ${dateFormat.getDate()} ${getMonthName(dateFormat.getMonth())} ${dateFormat.getFullYear()}
      `;
    });
    console.log(`upcoming trips: ${text}`);

    const responseCard = buildResponseCard(
      'Which trip do you want to view its details?',
      'Please choose an option',
      null,
      buttons
    );

    callback(elicitSlot(
      sessionAttributes,
      TRIPS_INTENT,
      TRIPS_SLOTS,
      'trip',
      text,
      responseCard
    ));
  }
};

export const tripService = (intentRequest, callback) => {
  const { userId, sessionAttributes, currentIntent: { slots }, inputTranscript } = intentRequest;
  const { trip, action } = slots;

  if (action) {
    switch (action) {
    case 'removeTrip':
      removeSelectedTrip(intentRequest, callback);
      break;
    case 'checkTrips':
      checkAvailableTrips(intentRequest, callback);
      break;
    case 'bookHotel':
      searchHotel(intentRequest, callback);
      break;
    case 'bye':
      endService(intentRequest, callback);
      break;
    default:
      break;
    }
  } else if (trip) {
    selectTrip(intentRequest, callback);
  } else {
    checkAvailableTrips(intentRequest, callback);
  }
};
