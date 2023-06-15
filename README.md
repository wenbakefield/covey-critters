# Covey Critters [![Netlify Status](https://api.netlify.com/api/v1/badges/73fcfae7-3267-4090-8906-3cc875a184bc/deploy-status)](https://app.netlify.com/sites/clever-marigold-258b59/deploys)

![brown-bear](https://github.com/wenbakefield/covey-critters/assets/8831999/9dcb5c70-b30c-435c-a737-fe929490179e) ![white-sheep](https://github.com/wenbakefield/covey-critters/assets/8831999/07d7aa51-0767-4572-b517-db52f2665622) ![green-cobra](https://github.com/wenbakefield/covey-critters/assets/8831999/9dd3d8a2-b90e-4e64-a84c-931718e1399f) ![red-snake](https://github.com/wenbakefield/covey-critters/assets/8831999/5c42bc70-7be1-4531-a519-9d2c32e0daea) ![gray-mouse](https://github.com/wenbakefield/covey-critters/assets/8831999/aa39e03f-fd18-4fd3-899b-14950b05f11a) ![gray-wolf](https://github.com/wenbakefield/covey-critters/assets/8831999/5b13cbb3-c9d0-42b5-b168-87ee7442119e) ![pigeon](https://github.com/wenbakefield/covey-critters/assets/8831999/1ba6c737-9c60-4bf5-a867-169ccf753fd1) ![seagull](https://github.com/wenbakefield/covey-critters/assets/8831999/3e21e2d7-1502-44d4-b5a8-bf95665d9146) 

[Demo](https://coveytown.benwakefield.dev/)

[Project Report](https://github.com/wenbakefield/covey-critters/blob/dfb9e2fb954eb0bab35a41f3c5786a528cab3fb1/docs/report.pdf)

Covey Critters is a feature implementation for Covey.Town. We thought that players in the town should be able to compete in a carnival game, to earn a high score and a pet, which would follow them around. Thus, we implemented the following features, along with general improvements:
- Carnival Game Area - where the user can play a game to win a critter based on their score
- Leaderboard - where the user can see how their score compares against other players
- Covey Critter - an animated sprite that follows the user, with unique characteristics

## Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/), and is designed to be reused across semesters.
You can view our reference deployment of the app at [app.covey.town](https://app.covey.town/), and our project showcase ([Spring 2022](https://neu-se.github.io/CS4530-Spring-2022/assignments/project-showcase), [Spring 2021](https://neu-se.github.io/CS4530-CS5500-Spring-2021/project-showcase)) highlight select student projects.

![Covey.Town Architecture](docs/covey-town-architecture.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react). Twilio's React Starter App is packaged and reused under the Apache License, 2.0.

A backend service (in the `townService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `townService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `townService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `townService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `REACT_APP_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the towns service to another location, put that location here instead)

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.
