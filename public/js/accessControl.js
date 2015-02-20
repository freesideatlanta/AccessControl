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

var LocationAccess = function(dayName) {
	this.dayName = dayName;
	this.cronString = '';
}
angular.module('freesideAccessControl', [
	'ngRoute',
	'ngDragDrop',
	'ui.bootstrap',
	'app.user.controllers',
	'app.location.controllers',
	'app.user.services',
	'app.location.services'
	])
	.config([ '$routeProvider', 
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