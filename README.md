# Soul Machines React Reference UI

This template succeeds the previous [react-template](https://github.com/soulmachines/react-template). This is a complete re-write based off of [create-react-app](https://github.com/facebook/create-react-app) and is designed mainly to provide a simpler and more familiar developer experience.

This template serves as "opinionated documentation," in that it contains most of the functionality that UI's should have and how to use it. As members of Soul Machines Customer Success engineering, we believe this is a good example of how the user flow and interaction with the Digital Person should work. This template is provided with the expectation that most, if not all, of the styling will be altered.

## Setup

In order to run this application, you'll either need an API key or a token server. Most projects will use an API key--token servers are only necessary when interfacing with a non-native NLP through a orchestration server.

### Copy `.env.example` contents into `.env`
Create an empty text file called `.env` and copy the contents of `.env.example` into it. These environment variables are required for the UI to run.

If using an API key, set `REACT_APP_PERSONA_AUTH_MODE` to `0` and populate `REACT_APP_TOKEN_URL` with your key.

If using an orchestration server, set `REACT_APP_PERSONA_AUTH_MODE` to `1` and populate `REACT_APP_TOKEN_URL` with your token server endpoint and set `REACT_APP_TOKEN_URL` to `true`.

### `npm install`
Run to install the project's dependencies.

### `npm start`
Starts the development server. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will automatically reload when you make changes.

### `npm run build`
Builds the app for production to the `build` folder. The files will be bundled and minified for production.

## Linting & Code Style

This project strictly follows [AirBnB's JavaScript style guide](https://github.com/airbnb/javascript). We recommend you install [ESLint](https://eslint.org/) in your editor and adhere to its recommendations.

We have also provided an `.editorconfig` file that you can use in your editor to match the indentation, whitespace, and other styling rules we used in creating this template.
