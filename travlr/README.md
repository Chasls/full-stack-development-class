# Travlr Getaways — Module One

This folder is a working Node.js and Express shell for the supplied Travlr Getaways customer-facing website.

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

3. Open <http://localhost:3000> in a browser.

On a Windows computer that blocks PowerShell scripts, use `npm.cmd install`, `npm.cmd start`, and `npm.cmd test` instead. From this repository's root, `npm.cmd start` also starts the application, or you can run `start.cmd`.

## Test the application

```text
npm test
```

The test suite starts Express on a temporary port and verifies the home page, all supplied HTML pages, the stylesheet, the health endpoint, and 404 handling.

## Express architecture

```text
travlr/
|-- app.js               Express configuration
|-- server.js            Node.js server entry point
|-- package.json         Dependencies and run scripts
|-- public/              Static customer-facing website
|   |-- *.html
|   |-- css/
|   `-- images/
`-- test/                Automated server tests
```

This structure addresses the Module One rubric by building the site with Node.js and Express, placing all static content in Express's `public` folder, and providing a repeatable test that proves Express serves the content.
