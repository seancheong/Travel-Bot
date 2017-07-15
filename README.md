# Travel Bot

A [nodejs](https://nodejs.org/en/) Lambda application that serves as a proxy for travel bot functionality


## Inspiration
I always wanted a personal assistant that can handle all my travel related stuff, since I like to travel so much. For example, I find it troublesome to find hotel bookings and itineraries through a bunch of emails. Life will be much more easier if a personal assistant able to manage and consolidate all those information in one place, and fetch it to you whenever you need it.

## What it does
Travel Bot will be able to search for hotels whenever a user enter the place that he wanted to go. Then, user will be able to see a list hotels from the results. Furthermore, user can even view the reviews for that particular hotel, if he selects the **"View Reviews"**, and top 3 reviews will be shown. When user selects **"Yes"**, it will help the user to book the particular hotel.

Travel Bot also be able to store the hotels that you have been booked. User can view all the hotels booked anytime he wants. Besides that, user can remove any booked hotels by selecting "Remove Selecting Trip".

## How I built it
First of all, Travel Bot is powered by [AWS Lex](https://aws.amazon.com/lex/), one of AWS AI service for building conversational interfaces into any application using voice and text. Besides, Travel Bot has been integrated with [Slack](https://slack.com/), so user can access Travel Bot by Slack. It also integrated with [AWS Lambda](https://aws.amazon.com/lambda/) in order to make necessary API calls and establish database connection.

For now, hotels that provided by Travel Bot are results from *Airbnb's API*, I also made use of *Google's Geolocation API* to format the place that the user want to search. Every trips that saved inside Travel Bot are saved inside a non relational database, [MongoDB](https://www.mongodb.com/). Travel Bot connects to MongoDB using [mlab](https://mlab.com/).

## Challenges I ran into
Since Travel Bot is using AWS Lambda to fetch the list of hotel search results, and with AWS Lambda being stateless in every call, I found it difficult at first to make Travel Bot to be able to let user to scan through a list of hotels by selecting either **"Show Next Hotel"**/**"Show Previous Hotel"**.

In the end I able to overcome the challenge by saving the list of result in the MongoDB whenever a user do a hotel search, and passing the current index that the user is viewing to AWS Lex's slots. With this, user able to scan through the list with only one API call to search the hotel.

## Accomplishments that I'm proud of
Able to build a travel assistant that I have always dream of.

## What I learned
Able to build an application using AWS Lex and integrate it with AWS Lambda.

## What's next for Travel Bot
For now, Travel Bot is only able book and manage hotels in the trips. Since almost every travel trip will has flight involve, in the future I wish to add in flight booking too, so that user will be able to manage hotels and flights together too inside their trips.

### Instructions

**install** - install all required packages under *./node_modules* folder

```shell
yarn install
```

**build** - creates the build artifacts under the *./build* folder

```shell
yarn build
```

**deploy** - creates the build artifacts and deploy it to AWS Lambda

```shell
yarn deploy
```
**clean** - cleans the build artifacts directories

```shell
yarn run clean
```
