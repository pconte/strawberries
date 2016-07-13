var Client = require('node-rest-client').Client;

var client = new Client();

client.get("http://api.pugetsound.onebusaway.org/api/where/trips-for-route/1_100016.json?key=TEST", function (data, response) {
	// parsed response body as js object
	console.log(data);
	// raw response
	//console.log(response);
});
