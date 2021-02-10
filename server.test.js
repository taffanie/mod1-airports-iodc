const app = require("./server"); // Link to your server file
const request = require("supertest");
const Airports = require("./airports.json");

// Get all airports
describe("GET /airports", () => {

  it("responds with application/json", (done) => {
    request(app)
      .get("/airports")
      .set("Accept", "application/json")
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200, done);
  });

  it("gets all the airports - status 200", (done) => {
    request(app)
      .get("/airports")
      .expect(res => {
        expect(res.body.length).toBe(28868)
      })
      .expect(200, done);
  });

  it("responds with status code 200", (done) => {
    request(app)
      .get("/airports")
      .expect(200, done);
  });

});

// Get all airports paginated
describe("GET /airports/pages", () => {

  it("gets 25 airports if no pageSize query param", (done) => {
    request(app)
      .get("/airports/pages")
      .query({ page: 1 })
      .expect(res => {
        expect(res.body.length).toBe(25)
      })
      .expect(200, done);
  });

  it("gets 5 airports if pageSize query param is 5", (done) => {
    request(app)
      .get("/airports/pages")
      .query({ page: 1, pageSize: 5 })
      .expect(res => {
        expect(res.body.length).toBe(5)
      })
      .expect(200, done);
  });

});

// Get specific airport
describe("GET /airports/:icao", () => {

  it("gets airport matching the icao - status 200", (done) => {
    request(app)
      .get("/airports/00AZ")
      .expect(res => {
        // console.log(res.body)
        expect(res.body.icao).toBe("00AZ")
        expect(res.body.state).toBe("Arizona")
      })
      .expect(200, done);
  });

});

const testAirport = {
  icao: 'ABCD',
  iata: 'ABC',
  name: 'ABC Airport',
  city: 'ABC City',
  state: 'ABC State',
  country: 'ABC Country',
  elevation: 1234,
  lat: 12.3456789,
  lon: 98.7654321,
  tz: 'ABC/ABCDEFG'
}

// Create airport
describe("POST /airports", () => {

  it("creates new airport - status 201", (done) => {
    request(app)
      .post("/airports")
      .send(testAirport)
      .expect(res => {
        expect(res.body.icao).toBe(testAirport.icao)
      })
      .expect(201, done)
  });

});

// Update airport
describe("PUT /airports/:icao", () => {

  const updatedTestAirport = {
    icao: 'ABCD',
    iata: 'PEG',
    name: 'PEG Airport',
    city: 'PEG City',
    state: 'PEG State',
    country: 'PEG Country',
    elevation: 1234,
    lat: 12.3456789,
    lon: 98.7654321,
    tz: 'ABC/ABCDEFG'
  }

  it("updates specified airport - status 200", (done) => {
    request(app)
      .put("/airports/" + testAirport.icao)
      .send(updatedTestAirport)
      .expect(res => {
        expect(res.body.name).toBe(updatedTestAirport.name)
      })
      .expect(200, done)
  })

})

// Delete airport
describe("DELETE /airports/:icao", () => {

  it("deletes specified airport - status 204", (done) => {
    request(app)
      .delete("/airports/" + testAirport.icao)
      .expect(204, done);
  })

})

// 200 ok, 201 created, 204 successful request but no content returned, 404 not found
// npm run test -- --watchAll