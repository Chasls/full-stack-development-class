# Travlr Getaways - Module Two

This folder contains the Express application for the Travlr Getaways customer-facing website. The travel page uses an MVC structure and Handlebars templates, while the remaining supplied pages and site assets continue to be served from the `public` folder.

## Run the application

Run these commands from the `travlr` folder. If your terminal is at the repository root, first run `cd travlr`.

1. Install the dependencies:

   ```text
   npm install
   ```

2. Start Express:

   ```text
   npm start
   ```

3. Open <http://localhost:3000/travel> in a browser.

On a Windows computer that blocks PowerShell scripts, use `npm.cmd install`, `npm.cmd start`, and `npm.cmd test` instead. From this repository's root, `npm.cmd start` also starts the application, or you can run `start.cmd`.

## Test the application

```text
npm test
```

The test suite verifies all supplied static pages and assets, the `/travel` MVC route, the controller data rendered by Handlebars, the health endpoint, and 404 handling.

## Application structure

```text
travlr/
|-- app.js                         Express and Handlebars configuration
|-- server.js                      Node.js server entry point
|-- package.json                   Dependencies and run scripts
|-- app_server/
|   |-- controllers/travel.js      Travel data and rendering controller
|   |-- routes/index.js            Public website routes
|   `-- views/
|       |-- partials/header.hbs    Shared page header
|       |-- partials/footer.hbs    Shared page footer
|       `-- travel.hbs             Dynamic travel page template
|-- public/                        Static pages, styles, and images
`-- test/                          Automated application tests
```

A request to `/travel` moves through the Express route to the travel controller. The controller supplies the page title and trip information, and Handlebars renders that data into the travel view with shared header and footer partials.
