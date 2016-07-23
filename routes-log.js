#!/usr/bin/env node

const FREQUENCY = 1000 * 10; // interval in milliseconds to gather data for a single row
const WHITELIST = [
  'activeTripId',
  'status',
  'serviceDate',
  'orientation',
  'lastKnownOrientation',
  'phase',
  'lastKnownLocation',
  'position',
  'vehicleId',
  'situationIds'
];
const KEY = '3b395257-2eb8-4d5e-adcf-70103c6b5a41';

var os = require('os');
const MACHINE_ID=os.hostname();

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
      filename: 'routes-log.log',   // Name of log file.  Consider deleting it if it preexists.
      level: 'data'
    })
  ]
});

var routeIds = ['1_100016', '1_100017']; // these are the routeIds for routes #118 and #119
var vehicles = {};

routeIds.forEach(function (routeId) {
  tripsForRoute(routeId);
  setInterval(function () {
    tripsForRoute(routeId);
  }, FREQUENCY);
});

function tripDetails(tripDetailsUrl) {
  client.get(tripDetailsUrl, function (data, response) {
    var status = data.data.entry.status;
    var existingV = vehicles[status.vehicleId];
    var now = new Date().getTime();
    var elapsedS = existingV ? Math.floor((now - existingV.time) / 1000) : null;

    if (!status.vehicleId) {
      console.error('Vehicle id is missing!', status);
      return;
    }
    if (positionsMatch(existingV, status)) {
      console.log(`positions match for ${status.vehicleId} for ${elapsedS} seconds`);
      return;
    }

    var row = cloneWhitelist(status, WHITELIST);
    row.mid = MACHINE_ID;
    row.dataTime = data.currentTime;
    row.time = now;
    row.elapsed = elapsedS;
    vehicles[status.vehicleId] = row;
    logger.data(row);
  });
}

function tripsForRoute(routeId) {
  var tripsForRouteUrl = `http://api.pugetsound.onebusaway.org/api/where/trips-for-route/${routeId}.json?key=${KEY}`;

  try{
    client.get(tripsForRouteUrl, function (data, response) {
      var trips = data.data.references.trips;

      trips.forEach(function (trip) {
        var tripId = trip.id;
        var tripDetailsUrl = `http://api.pugetsound.onebusaway.org/api/where/trip-details/${tripId}.json?key=${KEY}`;

        try{
          tripDetails(tripDetailsUrl);
        }catch(e){
          console.error(e);
        }

      });
    });
  }catch(e){
    console.error(e);
  }
}

function positionsMatch(a, b) {
  if (!a || !b) return false;
  return (a.lastKnownLocation === b.lastKnownLocation || (a.lastKnownLocation.lat === b.lastKnownLocation.lat &&
    a.lastKnownLocation.lon === b.lastKnownLocation.lon)) && 
    a.position.lat === b.position.lat &&
    a.position.lon === b.position.lon;
}

logger.data({
  time: Date.now(),
  ev: 'start',
  mid: MACHINE_ID,
  fq: FREQUENCY
});

process.on( 'SIGINT', function() {
  logger.data({
    time: Date.now(),
    mid: MACHINE_ID,
    ev: 'stop'
  });
  process.exit( );
});

function cloneWhitelist (o, wl) {
  var o1 = {};
  for (var k in o) {
    if (wl.indexOf(k) !== -1) {
      o1[k] = o[k];
    }
  }
  return o1;
}

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
