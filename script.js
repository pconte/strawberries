var Client = require('node-rest-client').Client;
var client = new Client();

var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug' }),
    new (winston.transports.File)({
      filename: 'data.log',
      level: 'silly'
    })
  ]
});

var tripsForRouteUrl;
var tripDetailsUrl;

var routeId = '1_100016'; // this is the routeId for route #118
var trips = [];
var tripId;
var status;
var row;

setInterval(function () {
  //console.log('========');
  tripsForRouteUrl = `http://api.pugetsound.onebusaway.org/api/where/trips-for-route/${routeId}.json?key=TEST`;

  client.get(tripsForRouteUrl, function (data, response) {
    trips = data.data.references.trips;
    //console.log(data.currentTime, trips);

    trips.forEach(function (trip) {
      tripId = trip.id;
      tripDetailsUrl = `http://api.pugetsound.onebusaway.org/api/where/trip-details/${tripId}.json?key=TEST`;

      client.get(tripDetailsUrl, function (data, response) {
        status = data.data.entry.status;
        //console.log(data.currentTime, status.activeTripId, status.lastKnownLocation);
        row = {
          time: data.currentTime,
          tripId: status.activeTripId,
          location: status.lastKnownLocation
        };
        logger.log('silly', JSON.stringify(row));
      });
    });
  });
}, 1000);
