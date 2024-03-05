# Travel Helper (Server)
This is the server side of a tour management LINE LIFF app, which also provides real-time exchange rate conversion through a LINE chatbot. It is created using Node.js, Express.js, pm2, MongoDB, Mongoose, and LINE SDK, and is hosted on Render.

## Table of Contents

- [Technologies](https://chat.openai.com/c/aab99b04-9441-4cd1-a694-627c0c6a582f#technologies)
- [Launch](https://chat.openai.com/c/aab99b04-9441-4cd1-a694-627c0c6a582f#launch)
- [Setup](https://chat.openai.com/c/aab99b04-9441-4cd1-a694-627c0c6a582f#setup)
- [Code Examples](https://chat.openai.com/c/aab99b04-9441-4cd1-a694-627c0c6a582f#code-examples)
- [API Schema](https://chat.openai.com/c/aab99b04-9441-4cd1-a694-627c0c6a582f#api-schema)
- [Inspiration](https://chat.openai.com/c/aab99b04-9441-4cd1-a694-627c0c6a582f#inspiration)
- [Todos](https://chat.openai.com/c/aab99b04-9441-4cd1-a694-627c0c6a582f#todos)


## Technologies

- Node.js 18
- Express 4.18.2
- Mongoose 5.13.22
- pm2 5.3.1
- node-fetch-cache 4.1.0
- @line/bot-sdk 8.0.0

## Launch

➡️  [VISIT TRAVEL HELPER SERVER](https://travel-helper-server.onrender.com/)
- Deployed on Render (The web service runs in Singapore)
- **The instance will spin down with inactivity, which can delay requests by 50 seconds or more.**

## Setup

To run this project locally, install it using npm and set up the environment variables:
```
$ npm install
$ npm run dev
```

Add the following keys to your `.env` file:
```
NODE_ENV=development
PORT=3001
DATABASE=your_mongoDB_connection_string
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
```
## Features

### Tour Management APIs

Example code to fetch tour data stored in the database, sorted by date:

```
fetch('https://travel-helper-server.onrender.com/api/v1/tours?sort=date',
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your_access_token_here'
    }
  })
```

### LINE Currency Exchange Chatbot

<img src="https://github.com/yu-tzi/travel-helper-server/assets/59299530/be08be05-33b0-4988-9057-857e9e05b7f2" weight="230" height="330" alt="LINE Currency Exchange Chatbot Image">


## API Schema

- See [API Documentation](https://travel-helper-server.onrender.com/api-docs/) **(The instance will spin down with inactivity, which can delay requests by 50 seconds or more)**
- For the YAML file, see [api.yaml on GitHub](https://github.com/yu-tzi/travel-helper-server/blob/main/api.yaml).

## Inspiration

This app is inspired by [tutorials by Jonas Schmedtmann](https://www.udemy.com/user/jonasschmedtmann/).

## Todos

- [ ] Develop common functions to handle errors and logging, reducing code duplication.
- [ ] Implement login and signup authentication processes.
- [ ] Configure CORS to restrict the domains allowed to make requests.


