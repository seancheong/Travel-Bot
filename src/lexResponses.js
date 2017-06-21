import { closeDB } from './helper';

// Build a message for Lex responses
const buildMessage = content => {
  const contentType = 'PlainText';

  return { contentType, content };
};

export const close = (sessionAttributes, message) => {
  closeDB();

  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState: 'Fulfilled',
      message: buildMessage(message)
    }
  };
};

export const elicitSlot = (sessionAttributes, intentName, slots, slotToElicit, message, responseCard) => {
  closeDB();

  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message: message ? buildMessage(message) : null,
      responseCard
    }
  };
};
