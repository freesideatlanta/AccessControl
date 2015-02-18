var accessControl = angular.module('freesideAccessControl', ['ngRoute','ngDragDrop']);

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

accessControl.controller('userController', function(userService, locationService, $scope, $http) {
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
		
	$scope.saveUser = function() {
		$http.post('/api/users', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
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
	
	$scope.loadUser = function(user) {
		console.log(user);
		//do something here for the locations/
		if (!user.allowedLocations) {
			user.allowedLocations = [];
		}
		$scope.formData = user;
		var locationList = $scope.locations.slice();
		$scope.formData.disallowedLocations = [];
		//console.log(user.allowedLocations);
		var allowedIdArray = [];
		for (var i = 0; i < user.allowedLocations.length; i++) {
			allowedIdArray[i] = user.allowedLocations[i].locationId;
		}
		for (var i = 0; i < locationList.length; i++) {
			var foundIndex = allowedIdArray.indexOf(locationList[i].locationId);
			if (foundIndex < 0) {
				$scope.formData.disallowedLocations.push(locationList[i]);
			}
		}
	};
	
	$scope.accessDrag = function(event) {
	/*
		if (event.target.id == 'allowedList') {
			var locationIndex = eval('(' + event.toElement.attributes[3].value + ')').index;
			$scope.formData.allowedLocations.push($scope.formData.disallowedLocations[locationIndex]);
			$scope.formData.disallowedLocations.splice(locationIndex, 1);
		} else if (event.target.id == 'disallowedList') {
			var locationIndex = eval('(' + event.toElement.attributes[3].value + ')').index;
			$scope.formData.disallowedLocations.push($scope.formData.allowedLocations[locationIndex]);
			$scope.formData.allowedLocations.splice(locationIndex,1);
		}
		*/
	};
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

accessControl.controller('locationController', function(locationService, $scope, $http) {
	$scope.formData = {};
	
	$scope.initLocations = function() {
		locationService.getLocations().then(function(data) {
			$scope.locations = data.data;
		});
	};

	$scope.initLocations();
		
	$scope.saveLocation = function() {
		$http.post('/api/locations', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
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
	
	$scope.loadLocation = function(location) {
		$scope.formData = location;
	};
});