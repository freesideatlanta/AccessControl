angular.module('app.location.controllers', [])
	.controller('locationModalController', function($scope, $modalInstance, location, saveCallback) {
	
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
})
	.controller('locationController', function(locationService, $scope, $http, $modal) {
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

angular.module('app.location.services', [])
	.factory('locationService', function($http, $q) {

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