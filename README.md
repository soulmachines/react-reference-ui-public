# Soul Machines React Reference UI

This template succeeds the previous [react-template](https://github.com/soulmachines/react-template). This is a complete re-write based off of [create-react-app](https://github.com/facebook/create-react-app) and is designed mainly to provide a simpler and more familiar developer experience.

This template serves as "opinionated documentation," in that it contains most of the functionality that UI's should have and how to use it. As members of Soul Machines Customer Success engineering, we believe this is a good example of how the user flow and interaction with the Digital Person should work. This template is provided with the expectation that most, if not all, of the styling will be altered.

## Setup

You need a token server to authenticate the UI session with the Soul Machines Persona server. Either Soul Machines will provide an endpoint, or you will have to spin up an instance of [express-token-server](https://github.com/soulmachines/express-token-server) with your credentials from DDNA Studio.

### `npm install`
Run to install the project's dependencies.

### `npm start`
Starts the development server. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will automatically reload when you make changes.

### `npm run build`
Builds the app for production to the `build` folder. The files will be bundled and minified for production.

## Changes from `react-template`

The main objective of this re-write was a simplification of as much of the structure as possible. Secondly, with the knowledge that most consumers of this template are implementing an entirely custom design, I wanted to provide an opinionated reference for how the UI is meant to behave and its capabilities.

The main change is the elimination of the Soul Machines context. Interaction with `smwebsdk` is done with events through the Redux store. Importantly, this allows us to use entirely function components with React hooks, massively reducing the number of lines of code when compared to class components.

Additionally, routing has been added to the app with the use of `react-router-dom`. This allows us to build discrete pages into the experience. For example, rather than having a single parent component that shows the welcome and loading screens based on application state, each route can be its own component that redirects to the next route when a certain condition has been met. This makes it easier to modify and add to the user flow.
