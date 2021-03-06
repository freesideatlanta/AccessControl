// server.js

    // set up ========================
    var express  = require('express');
	require('date-utils');
    var app      = express();
    var mongoose = require('mongoose'), Schema = mongoose.Schema;
    var morgan = require('morgan');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');

    // configuration =================

    var acDB = mongoose.createConnection('mongodb://localhost/accessControl');
	var logDB = mongoose.createConnection('mongodb://localhost/accessLogging');

    app.use(express.static(__dirname + '/public'));
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({'extended':'true'}));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());
	
	var LogMessage = logDB.model('LogMessage', {
		message: String,
		timestamp: Date,
		isFailed: Boolean
	});

	var locationSchema = new Schema({
		locationId: String,
		locationName: String,
		days: [{
			dayName: String,
			cronString: String
		}]
	});
	
	var userSchema = new Schema({
	    memberName: String,
	    cardNumber: String,
		active: Boolean,
		allowedLocations: [locationSchema]
    });
	
    var User = acDB.model('User', userSchema);
		
	var Location = acDB.model('Location', locationSchema);

// routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all users
    app.get('/api/users', function(req, res) {

        // use mongoose to get all users in the database
        User.find(function(err, users) {
            if (err)
                res.send(err)
			console.log(users);
            res.json(users); // return all users in JSON format
        });
    });
	
	var logMessageCallback = function(err, message) {
		if (err)
			console.log(err);
		else 
			console.log(message);
	};
	
	app.get('/api/users/auth', function(req, res) {
		//console.log(req.query.locationId);
		//console.log(req.query.cardNumber);
		User.findOne({}).where('cardNumber').equals(req.query.cardNumber).and('allowedLocations').elemMatch({locationId: req.query.locationId})
			.exec(function(err, found) {
				if (err)
					res.send(err);
				if (found != null) {
					//console.log("logging: " + found)
					if (found.active) {
						var hasAccess = false;
						if (found.allowedLocations) {
							for (var i = 0; i < found.allowedLocations.length; i++) {
								var location = found.allowedLocations[i];
								if (location.locationId == req.query.locationId) {
									//console.log("they've got the location, checking hourly access");
									var now = new Date();
									//console.log(now);
									var dayString = now.toFormat('DDDD');
									var hour = now.toFormat('HH24');
									for (var d = 0; d < location.days.length; d++) {
										var day = location.days[d];
										if (dayString == day.dayName) {
											if (day.cronString != '') {
												if (day.cronString == '*') {
													hasAccess = true;
												} else {
													//figure out how to parse out the string here
													//the hour will be zero padded so coerce it to a number
													var hourNum = parseInt(hour);
													var ranges = day.cronString.split(',');
													for (var t = 0; t < ranges.length; t++) {
														var range = ranges[t];
														if (range.indexOf('-') >= 0) {
															//console.log("it's a time range");
															var hours = range.split('-');
															if (hourNum >= parseInt(hours[0]) && hourNum <= parseInt(hours[1])) {
																hasAccess = true;
																break;
															}
														} else {
															//console.log("it's a number");
															if (hourNum == parseInt(range)) {
																hasAccess = true;
																break;
															}
														}
													}
												}
											}
											break;
										}
									}
									break;
								}
							};
						}
						if (!hasAccess) {
							var message = new LogMessage({
								message: 'User ' + found.memberName + ' attempted access to ' + location.locationName,
								isFailed: true,
								timestamp: new Date()
							});
							LogMessage.create(message, logMessageCallback);
						} else {
							var message = new LogMessage({
								message: 'User ' + found.memberName + ' accessed ' + location.locationName,
								isFailed: false,
								timestamp: new Date()
							});
							LogMessage.create(message, logMessageCallback);
						}
						res.send(hasAccess);
					} else {
						Location.findOne({locationId: req.query.locationId}, function(err, location) {
							var locationString = '';
							if (location) {
								locationString = location.locationName;
							} else {
								locationString = location.locationId;
							}
							var message = new LogMessage({
								message: 'Unauthorized access attempt by inactive user: ' + found.memberName + ' at location: ' + locationString,
								isFailed: true,
								timestamp: new Date()
							});
							LogMessage.create(message, logMessageCallback);
						});
						res.send(false);
					}
				} else {
					User.findOne({}).where('cardNumber').equals(req.query.cardNumber)
						.exec(function(err, user) {
							if (err) {
								console.log(err);
							}
							var message = new LogMessage({
								isFailed: true,
								timestamp: new Date()
							});
							Location.findOne({locationId: req.query.locationId}, function(err, location) {
								if (location) {
									locationString = location.locationName;
								} else {
									locationString = req.query.locationId;
								}
								if (user != null) {
									message.message = 'Unauthorized access attempt by ' + user.memberName + ' at location: ' + locationString;
								} else {
									message.message = 'Access attempted with card number ' + req.query.cardNumber + ' by unknown user';
								}
								LogMessage.create(message, logMessageCallback);
							});
						});
					res.send(false);			
				}
			});
	});
	
	//get all locations
	app.get('/api/locations', function(req, res) {
		Location.find(function(err, locations) {
			if (err) {
				res.send(err);
			}
			res.json(locations);
		});
	});

    // create user and send back all users after creation
    app.post('/api/users', function(req, res) {

        // create a todo, information comes from AJAX request from Angular
		var postedUser = new User(req.body);
			console.log(req.body);
			postedUser.populate('allowedLocations');
			console.log(postedUser);
			/*
			postedUser.memberName = req.body.memberName;
			postedUser.cardNumber = req.body.cardNumber;
			postedUser.active = req.body.active;
			*/
			
		var insertUpdateCallback = function(err, user) {
			if (err)
				res.send(err);
				
			User.find(function(err, users) {
				if (err)
					res.send(err);
					
				res.json(users);
			});
		};
			
		if (req.body._id != null) {
			var postedUserObject = postedUser.toObject();
			delete postedUserObject._id
			
			
			var query = {_id:req.body._id};
			User.update(query, postedUserObject, {upsert:true}, insertUpdateCallback);
		} else {
			User.create(postedUser.toObject(), insertUpdateCallback);
		}
    });
	
	app.post('/api/locations', function(req, res) {
	
		var postedLocation = new Location();
			postedLocation.locationId = req.body.locationId;
			postedLocation.locationName = req.body.locationName;
		console.log(postedLocation);
			
		var createCallback = function(err, todo) {
            if (err)
                res.send(err);
            Location.find(function(err, locations) {
                if (err)
                    res.send(err)
                res.json(locations);
            });
        };
		if (req.body._id != null) {
			var postedLocationObject = postedLocation.toObject();
			delete postedLocationObject._id
			
			var query = {_id:req.body._id};
			Location.update(query, postedLocationObject, {upsert:true}, createCallback);
		} else {
			Location.create(postedLocation.toObject(), createCallback);
		}

    });

    // delete a user
    app.delete('/api/users/:user_id', function(req, res) {
        User.remove({
            _id : req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            // get and return all the users after deleted one
            User.find(function(err, users) {
                if (err)
                    res.send(err)
                res.json(users);
            });
        });
    });
	
	// delete a location
    app.delete('/api/locations/:location_id', function(req, res) {
		//if a location is deleted, user records must be updated
		//example query to find user records
		//db.users.find({allowedLocations: { $elemMatch: { locationId: 'location1'}}})
		Location.findOne({_id: req.params.location_id}, function(err, location) {
			console.log(location.locationId);
			User.find({}).where('allowedLocations').elemMatch({locationId: location.locationId})
			.exec(function(err, users) {
				for (var u = 0; u < users.length; u++) {
					var user = users[u];
					var newAllowedLocations = [];
					for (var l = 0; l < user.allowedLocations.length; l++) {
						if (user.allowedLocations[l].locationId != location.locationId) {
							newAllowedLocations.push(user.allowedLocations[l]);
						}
					}
					console.log('before');
					console.log(user.allowedLocations);
					console.log('after');
					console.log(newAllowedLocations);
					
					user.allowedLocations = newAllowedLocations;
					var userObject = user.toObject();
					delete userObject._id;
					User.update({_id: user._id}, userObject, {upsert:true}, function(){});
				}
			});
		});
		
        Location.remove({
            _id : req.params.location_id
        }, function(err) {
            if (err)
                res.send(err);

            Location.find(function(err, locations) {
                if (err)
                    res.send(err)
                res.json(locations);
            });
        });
    });
	
	app.get('/api/logging', function(req, res) {
		LogMessage.find(function(err, logMessages) {
			if (err) {
				console.log("error retrieving log messages");
				res.send('');
			}
			res.json(logMessages);
		});
	});

// application -------------------------------------------------------------

    app.get('/*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");
