var accessControl = angular.module('freesideAccessControl', ['ngRoute']);

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

accessControl.controller('userController', function($scope, $http) {
	$scope.formData = {};

	$scope.init = function() {
		// when landing on the page, get all users and show them
		$http.get('/api/users')
			.success(function(data) {
				$scope.users = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	}
	
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
		$scope.formData = user;
	};
});

accessControl.controller('locationController', function($scope, $http) {
	$scope.formData = {};

	$scope.initLocations = function() {
		$http.get('/api/locations')
			.success(function(data) {
				$scope.locations = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	}
	
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
	}
	
	$scope.loadLocation = function(location) {
		$scope.formData = location;
	};
});