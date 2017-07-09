import { close, elicitSlot } from '../lexResponses';
import { buildResponseCard } from '../helper';
import { checkAvailableTrips } from './tripService';

const ACCOMODATION_INTENT = 'TravelBotAccommodation';
const ACCOMODATION_SLOTS = {
  date: null, days: null, hotelResponse: null, place: null
};

const TRIPS_INTENT = 'TravelBotTrips';
const TRIPS_SLOTS = {};

const checkTrips = (intentRequest, callback) => {
  console.log('checking trips');

  checkAvailableTrips(intentRequest, callback);
};

export const searchHotel = (intentRequest, callback) => {
  console.log('searching hotel');

  const { sessionAttributes } = intentRequest;

  callback(elicitSlot(
    sessionAttributes,
    ACCOMODATION_INTENT,
    ACCOMODATION_SLOTS,
    'place',
    'Where do you want to book your hotel? (Enter city name below, e.g. Las Vegas)',
    null
  ));
};

const decideService = (intentRequest, callback) => {
  console.log('deciding service');

  const { sessionAttributes, currentIntent: { slots } } = intentRequest;

  const responseCard = buildResponseCard(
    'How may I help you?',
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
    intentRequest.currentIntent.name,
    slots,
    'service',
    'Hi, I am Samantha, your personal travel bot.',
    responseCard
  ));
};

export const endService = (intentRequest, callback) => {
  const { sessionAttributes } = intentRequest;

  callback(close(
    sessionAttributes,
    'Bye bye, Thank you for using travelbot service.\nSee you again.'
  ));
};

export const greetingService = (intentRequest, callback) => {
  const { userId, sessionAttributes, currentIntent: { slots }, inputTranscript } = intentRequest;
  const { service } = slots;

  if (service) {
    switch (service) {
    case 'bookHotel':
      searchHotel(intentRequest, callback);
      break;
    case 'checkTrips':
      checkTrips(intentRequest, callback);
      break;
    case 'bye':
      endService(intentRequest, callback);
      break;
    default:
      break;
    }
  } else {
    decideService(intentRequest, callback);
  }
};
