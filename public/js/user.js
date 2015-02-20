angular.module('app.user.controllers', [])
	.controller('userController', function(userService, locationService, $scope, $http, $modal) {
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
	})
	.controller('userModalController', function($scope, $modalInstance, locations, user, saveCallback) {
	
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

angular.module('app.user.services', [])
	.factory('userService', function($http, $q) {

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