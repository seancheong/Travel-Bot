import { connectDB } from './helper';

import {
  accommodationService,
  greetingService,
  tripService
} from './services';

const dispatch = async (intentRequest, callback) => {
  const { userId, currentIntent, sessionAttributes, invocationSource } = intentRequest;
  const { name, slots } = currentIntent;

  console.log('connecting database');
  await connectDB();

  console.log(`intent received: ${JSON.stringify(intentRequest)}`);

  switch (name) {
  case 'TravelBotGreeting':
    greetingService(intentRequest, callback);
    break;
  case 'TravelBotAccommodation':
    accommodationService(intentRequest, callback);
    break;
  case 'TravelBotTrips':
    tripService(intentRequest, callback);
    break;
  default:
    break;
  }
};

export const handler = (event, context, callback) => {
  try {
    dispatch(event, response => callback(null, response));
  } catch (err) {
    callback(err);
  }
};
