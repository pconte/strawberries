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
      filename: 'single-vehicle-log.log',   // Name of log file.  Consider deleting it if it preexists.
      level: 'data'
    })
  ]
});

var vehicleId = '1_3756';

var positionsUrl = `http://api.pugetsound.onebusaway.org/api/where/vehicle/1_3756.xml?key=${KEY}`;

setInterval(function () {
  try{
  client.get(positionsUrl, function (data, response) {
    var row = {
      mid: MACHINE_ID,
      dataTime: data.currentTime,
      time: Date.now(),
      entry: data.response.data[0].entry
    };
    logger.data(row);
  });
  }catch(e){
    console.error(e);
  }
}, FREQUENCY);

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
})

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
