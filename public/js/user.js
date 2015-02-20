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
	.controller('userModalController', function($scope, $modalInstance, $modal, $q, locations, user, saveCallback) {
	
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
		
		$scope.openTimeModal = function(location) {
			$scope.modalInstance = $modal.open({
				templateUrl: 'templates/timeModal.html',
				backdrop: 'static',
				controller: 'timeModalController',
				resolve: {
					location: function() { return location; },
					user: function() { return user; }
				},
				keyboard: false
			});
		};
		
		$scope.drag = function(event) {
			event.preventDefault();
		}
		
		$scope.clearAccessList = function(event) {
			var index = eval('(' + event.toElement.attributes['jqyoui-draggable'].value + ')').index;
			console.log(index);
			console.log(user.disallowedLocations[index].days);
			user.disallowedLocations[index].days = null;
			console.log(user.disallowedLocations[index].days);
		}
	})
	.controller('timeModalController', function($scope, $modalInstance, location, user) {
		
		$scope.init = function() {
			
			$scope.locationName = location.locationName;
			console.log(location.days);
			if (location.days == null || location.days.length == 0) {
				var sun = new LocationAccess('Sunday');
				var mon = new LocationAccess('Monday');
				var tue = new LocationAccess('Tuesday');
				var wed = new LocationAccess('Wednesday');
				var thr = new LocationAccess('Thursday');
				var fri = new LocationAccess('Friday');
				var sat = new LocationAccess('Saturday');
				
				location.days = [sun, mon, tue, wed, thr, fri, sat];
			}
			$scope.location = location;
		};
		
		$scope.init();
		
		$scope.setCronString = function(day, string) {
			day.cronString = string;
		};
		
		$scope.cancelTimeModal = function() {
			$modalInstance.dismiss('cancel');
		}
		
		$scope.saveTimes = function() {
			console.log(location.days);
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