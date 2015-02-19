var User = function() {
	this.memberName = null;
	this.cardNumber = null;
	this.active = false;
	this.allowedLocations = [];
	this.disallowedLocations = [];
};

var Location = function() {
	this.locationId = null;
	this.locationName = null;
};

var accessControl = angular.module('freesideAccessControl', ['ngRoute','ngDragDrop','ui.bootstrap']);

accessControl.config([ '$routeProvider', 
	function($routeProvider) {
		$routeProvider
			.when('/users', {
				templateUrl : '/users.html',
				controller : 'userController'
			})
			.when('/locations', {
				templateUrl: '/locations.html',
				controller: 'locationController'
			})
			.otherwise({ 
				redirectTo: '/users' 
			});
	}
]);

accessControl.controller('userController', function(userService, locationService, $scope, $http, $modal) {
	$scope.formData = {};

	$scope.init = function() {
		// when landing on the page, get all users and show them
		userService.getUsers().then(function(data) {
				$scope.users= data.data;
		});
		locationService.getLocations().then(function(data) {
			$scope.locations = data.data;
			console.log($scope.locations);
		});
	};
	
	$scope.init();
		
	$scope.saveUser = function(user) {
		console.log(user);
		$http.post('/api/users', user)
            .success(function(data) {
                $scope.users = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
	};
	
	$scope.removeUser = function(id) {
		$http.delete('/api/users/' + id)
			.success(function(users) {
				$scope.users = users;
			})
			.error(function(data) {
				console.log("error while removing user with id: " + id);
			});
	}
	
	
	
	$scope.addUser = function() {
		console.log("adding user");
		
		$scope.loadUser(new User());
	};
	
	$scope.loadUser = function(user) {
		console.log(user);
		if (!user.allowedLocations) {
			user.allowedLocations = [];
		}
		
		var locationList = $scope.locations.slice();
		user.disallowedLocations = [];

		var allowedIdArray = [];
		for (var i = 0; i < user.allowedLocations.length; i++) {
			allowedIdArray[i] = user.allowedLocations[i].locationId;
		}
		for (var i = 0; i < locationList.length; i++) {
			var foundIndex = allowedIdArray.indexOf(locationList[i].locationId);
			if (foundIndex < 0) {
				user.disallowedLocations.push(locationList[i]);
			}
		}
		
		$scope.modalInstance = $modal.open({
			templateUrl: 'templates/userModal.html',
			backdrop: 'static',
			controller: 'userModalController',
			resolve: {
				locations: function() {
					return $scope.locations;
				},
				user: function() { return jQuery.extend(true, {}, user);},
				saveCallback: function() { return $scope.saveUser}
			},
			keyboard: false
		});
	};
});

accessControl.controller('userModalController', function($scope, $modalInstance, locations, user, saveCallback) {
	
	$scope.init = function() {
		$scope.user = user;
	};
	
	$scope.init();
	
	$scope.saveUser = function() {
		saveCallback($scope.user);
		$scope.cancelUserModal();
	}

	$scope.cancelUserModal = function() {
		console.log("cancelled");
		$scope.user = {};
		$modalInstance.dismiss('close')
	}
});

accessControl.controller('locationModalController', function($scope, $modalInstance, location, saveCallback) {
	
	$scope.init = function() {
		$scope.location = location;
	};
	
	$scope.saveLocation = function() {
		saveCallback($scope.location);
		$scope.cancelLocationModal();
	};
	
	$scope.cancelLocationModal = function() {
		$scope.location = {};
		$modalInstance.dismiss('close');
	};
	
	$scope.init();
});

accessControl.factory('userService', function($http, $q) {

	var userService = {};
	
	userService.getUsers = function() {
		return $http.get('/api/users')
				.success(function(data) {
					return data;
				})
				.error(function(data) {
					return 'Error: ' + data;
				});
	};
	
	return userService;
});

accessControl.factory('locationService', function($http, $q) {

	var locationService = {};
	
	locationService.getLocations = function() {
		return $http.get('/api/locations')
			.success(function(data) {
				return data;
			})
			.error(function(data) {
				return 'Error: ' + data;
			});
	}
	
	return locationService;
});

accessControl.controller('locationController', function(locationService, $scope, $http, $modal) {
	$scope.formData = {};
	
	$scope.initLocations = function() {
		locationService.getLocations().then(function(data) {
			$scope.locations = data.data;
		});
	};

	$scope.initLocations();
		
	$scope.saveLocation = function(location) {
		$http.post('/api/locations', location)
            .success(function(data) {
                $scope.locations = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
	};
	
	$scope.removeLocation = function(id) {
		$http.delete('/api/locations/' + id)
			.success(function(locations) {
				$scope.locations = locations;
			})
			.error(function(data) {
				console.log("error while removing location with id: " + id);
			});
	};
	
	$scope.addLocation = function() {
		$scope.loadLocation(new Location());
	};
	
	$scope.loadLocation = function(location) {
		
		$scope.modalInstance = $modal.open({
			templateUrl: 'templates/locationModal.html',
			backdrop: 'static',
			controller: 'locationModalController',
			resolve: {
				location: function() {
					return new jQuery.extend(true, {}, location);
				},
				saveCallback: function() { return $scope.saveLocation}
			},
			keyboard: false
		});
	};
});