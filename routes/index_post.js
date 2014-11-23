var db = require('../db');

var request = require('request');

var whereURL = 'http://query.yahooapis.com/v1/public/yql?format=json&q=select * from geo.placefinder where gflags="R" and text="{LAT},{LON}"';

var revgeo = function (lat, lon, callback) {
	var url = whereURL.replace("{LAT}", lat).replace("{LON}", lon);

	request(url, function (error, response, contentBody) {
		var address;
		try {
			address = JSON.parse(contentBody).query.results.Result;
			address = Array.isArray(address) ? address[0] : address;
			// console.log(address);
			address = address.line1 + " " + address.line2;
		}
		catch (e) {
			callback("Could not retrieve the location at " + lat + ", " + lon);
			return;
		}

		if (error || response.statusCode !== 200) {
			callback("Error contacting the reverse geocoding service.");
		}
		else {
			
			// Save an address
			db.Breadcrumb.create([
				{
					date: new Date(),
					latitude: lat,
					longitude: lon,
					address: address
				}
			], function (err) {
				// err - description of the error or null
                // Pass back both err and address at this point.
                callback(err, address);
			});

		}
	});
};

var pad = function (number, size) {
    var s = number + "";
    while (s.length < size) {
    	s = "0" + s;
    }
    return s;
};

var dateFormat = function(date) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1; //Months are zero based
	var day = date.getDate();

	var hour = date.getHours() + 1; // zero based
	var min = date.getMinutes() + 1; // zero based

	// Pad with leading zeros
	month = pad(month, 2);
	day = pad(day, 2);
	hour = pad(hour, 2);
	min = pad(min, 2);
	
	var formatted = year + '.' + month + '.' + day + ' ' + hour + ':' + min;
	
	console.log(date, formatted);
	
	return formatted;
};

module.exports = function (req, res) {
	var latitude = req.body.latitude;
	var longitude = req.body.longitude;

	revgeo(latitude, longitude, function (err, address) {
		console.log(latitude, longitude, err, address);

		db.Breadcrumb.find(function (err, items) {

			items.forEach(function(item) {
				console.log('item.date (1):', item.date);
				item.dateFormatted = dateFormat(item.date);
				console.log('item.date (2):', item.date);
			});

			res.render('home', {
				error: err,
				location: {
					latitude: latitude,
					longitude: longitude,
					address: address
				},
				breadcrumbs: items
			});
		});
		
	});
};