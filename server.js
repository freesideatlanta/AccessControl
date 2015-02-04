// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

    // configuration =================

    mongoose.connect('mongodb://localhost/accessControl');

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    var User = mongoose.model('User', {
	    memberName: String,
	    cardNumber: String,
		active: Boolean,
		access: {
			locationId: String,
			accessString: String //crontab style entry
		}
    });
	
	var Location = mongoose.model('Location', {
		locationId: String,
		locationName: String
	});

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
	
	app.get('/api/users/auth', function(req, res) {
		console.log(req.query.locationId);
		console.log(req.query.cardNumber);
		User.findOne({'cardNumber':req.query.cardNumber}, function(err, found) {
			if (err)
				res.send(err);
			if (found != null) {
				console.log("logging: " + found)
				if (found.active) {
					res.send(true);
				} else {
					res.send(false);
				}
			} else {
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
		var postedUser = new User();
			postedUser.memberName = req.body.memberName;
			postedUser.cardNumber = req.body.cardNumber;
			postedUser.active = req.body.active;
			
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
			Location.create(postedLocationObject.toObject(), createCallback);
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
        Location.remove({
            _id : req.params.location_id
        }, function(err, user) {
            if (err)
                res.send(err);

            Location.find(function(err, locations) {
                if (err)
                    res.send(err)
                res.json(locations);
            });
        });
    });

// application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");