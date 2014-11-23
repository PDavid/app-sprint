var orm = require('orm');

module.exports.Breadcrumb = null;

module.exports.init = function (done) {
	orm.connect('sqlite://breadcrumbs.db3', function (err, db) {
		
		var Breadcrumb = db.define('breadcrumb', {
			date: Date,
			latitude: Number,
			longitude: Number,
			address: String
		});

		Breadcrumb.sync(function(err) {
			if (err) {
				done("Error: could not create the database: " + err);
			}
			else {
				module.exports.Breadcrumb = Breadcrumb;
				done(null);
			}
		});		
	});
};