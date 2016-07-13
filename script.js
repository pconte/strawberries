var Client = require('node-rest-client').Client;
var client = new Client();

var tripsForRouteUrl;
var tripDetailsUrl;

var routeId = '1_100016';
var trips = [];
var tripId;
var status;

setInterval(function () {
  console.log('========');
  tripsForRouteUrl = `http://api.pugetsound.onebusaway.org/api/where/trips-for-route/${routeId}.json?key=TEST`;

  client.get(tripsForRouteUrl, function (data, response) {
    trips = data.data.references.trips;
    console.log(data.currentTime, trips);

    trips.forEach(function (trip) {
      tripId = trip.id;
      tripDetailsUrl = `http://api.pugetsound.onebusaway.org/api/where/trip-details/${tripId}.json?key=TEST`;

      client.get(tripDetailsUrl, function (data, response) {
        status = data.data.entry.status;
        console.log(data.currentTime, status.activeTripId, status.lastKnownLocation);
      });
    });
  });
}, 1000);
