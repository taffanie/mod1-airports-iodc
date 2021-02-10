const express = require("express");
const app = express();

// OpenID
const { auth, requiresAuth } = require('express-openid-connect');

// set ejs as view engine
const ejs = require("ejs");
app.set("view engine", "ejs");

// Body parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');

// our airports json
const airports = require("./airports.json");

// OpenID
// auth router attaches /login, /logout, and /callback routes to the baseURL
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'AX5NbdAKJ1ZHf3RUzajEAdpdfP0XYr8a',
  issuerBaseURL: 'https://mod1-day8.eu.auth0.com'
};

app.use(auth(config));

// --------------- AIRPORT ROUTES ---------------

// Get all airports 
app.get("/airports", requiresAuth(), (req, res) => {
  res.status(200).send(airports)
})

// Get all airports paginated (?page=1&pageSize=25)
app.get("/airports/pages", requiresAuth(), (req, res) => {
  let pageSize = 25
  if (req.query.pageSize) {
    pageSize = req.query.pageSize
  }
  let currentPage = req.query.page
  let index = (currentPage - 1) * pageSize
  const paginatedAirports = airports.slice(index, pageSize * currentPage)
  res.status(200).send(paginatedAirports);
});

// Get one airport
app.get("/airports/:icao", requiresAuth(), (req, res) => {
  const airport = airports.find(airport => airport.icao === req.params.icao)
  res.status(200).send(airport)
})

// Create airport
app.post("/airports", requiresAuth(), (req, res) => {
  const newAirport = req.body
  airports.push(newAirport)
  res.status(201).send(newAirport)
  fs.writeFile('./airports.json', JSON.stringify(airports, null, '\t'), (err) => {
    if (err) throw err;
    console.log('Airport created!')
  })
})

// Update airport
app.put("/airports/:icao", requiresAuth(), (req, res) => {
  const airportIndex = airports.findIndex(airport => airport.icao === req.params.icao)
  airports.splice(airportIndex, 1, req.body)
  res.status(200).send(req.body)
  fs.writeFile('./airports.json', JSON.stringify(airports, null, '\t'), (err) => {
    if (err) throw err;
    // console.log('Airport updated!')
  })
})

// Delete airport 
app.delete("/airports/:icao", requiresAuth(), (req, res) => {
  const airportIndex = airports.findIndex(airport => airport.icao === req.params.icao)
  const deleteAirport = airports.find(airport => airport.icao === req.params.icao)
  airports.splice(airportIndex, 1)
  res.status(204).send(deleteAirport)
  fs.writeFile('./airports.json', JSON.stringify(airports, null, '\t'), (err) => {
    if (err) throw err;
    // console.log('Airport deleted!')
  })
})

// --------------- OPENID USER ROUTES ---------------

// Protected profile route
app.get('/profile', requiresAuth(), (req, res) => {
  // res.send(JSON.stringify(req.oidc.user))
  res.render("profile", { user: req.oidc.user })
})

app.get("/", (req, res) => {
  res.render("index", { loggedIn: req.oidc.isAuthenticated() });
});

module.exports = app;