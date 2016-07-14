var Client = require('node-rest-client').Client;
var client = new Client();

var winston = require('winston');
var customLevels = {
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      data: 4
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
      data: 'purple'
    }
  };
winston.addColors(customLevels.colors);
var logger = new (winston.Logger)({
  levels: customLevels.levels,
  transports: [
    new (winston.transports.Console)({ level: 'data' }),
    new (winston.transports.File)({
      filename: 'data.log',
      level: 'data'
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
  tripsForRouteUrl = `http://api.pugetsound.onebusaway.org/api/where/trips-for-route/${routeId}.json?key=TEST`;

  client.get(tripsForRouteUrl, function (data, response) {
    trips = data.data.references.trips;

    trips.forEach(function (trip) {
      tripId = trip.id;
      tripDetailsUrl = `http://api.pugetsound.onebusaway.org/api/where/trip-details/${tripId}.json?key=TEST`;

      client.get(tripDetailsUrl, function (data, response) {
        status = data.data.entry.status;
        row = {
          time: data.currentTime,
          tripId: status.activeTripId,
          location: status.lastKnownLocation
        };
        logger.data(JSON.stringify(row));
      });
    });
  });
}, 1000);

/*
TODO:
- get a list of all routes that are currently running
- or alternatively, directly get all vehicles currently running (and derive rest of the data from the vehicle)
- modify the calls that are made (but it seems like the basic nest flow inside a SetInterval will still work?)

*/
