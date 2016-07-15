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
      filename: 'data.log',   // Name of log file.  Consider deleting it if it preexists.
      level: 'data'
    })
  ]
});

var routeIds = ['1_100016', '1_100017']; // these are the routeIds for routes #118 and #119

routeIds.forEach(function (routeId) {
  setInterval(function () {
    var tripsForRouteUrl = `http://api.pugetsound.onebusaway.org/api/where/trips-for-route/${routeId}.json?key=TEST`;

    client.get(tripsForRouteUrl, function (data, response) {
      var trips = data.data.references.trips;

      trips.forEach(function (trip) {
        var tripId = trip.id;
        var tripDetailsUrl = `http://api.pugetsound.onebusaway.org/api/where/trip-details/${tripId}.json?key=TEST`;

        client.get(tripDetailsUrl, function (data, response) {
          var status = data.data.entry.status;
          var row = {
            time: data.currentTime,
            routeId: routeId,
            activeTripId: status.activeTripId,
            status: status.status,
            serviceDate: status.serviceDate,
            orientation: status.orientation,
            lastKnownOrientation: status.lastKnownOrientation,
            phase: status.phase,
            lastKnownLocation: status.lastKnownLocation,
            position: status.position,
            vehicleId: status.vehicleId,
            situationIds: status.situationIds
          };
          logger.data(JSON.stringify(row));
        });
      });
    });
  }, 1000); // interval in milliseconds to gather data for a single row
});

/*
TODO:
- how often should the Interval loop run?
*/

/*
Strategies for analyzing the data:
- filter out redundant rows (and keep count)
- calculate difference between various timestamp-related fields
- plot locations and timestamps in some kind of visualizations
*/
