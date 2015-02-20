angular.module('app.logging.controllers', [])
	.controller('loggingController', function(loggingService, $scope, $http) {
		$scope.init = function() {
			loggingService.getLogMessages().then(function(data) {
				$scope.logMessages = data.data;
			});
		}
		
		$scope.init();
		
		$scope.resetFilter = function() {
			$scope.search = {};
		}
	});
	
angular.module('app.logging.services', [])
	.factory('loggingService', function($http) {
		var loggingService = {};
		
		loggingService.getLogMessages = function() {
			return $http.get('/api/logging')
				.success (function (data) {
					return data;
				});
		}
		
		return loggingService;
	});