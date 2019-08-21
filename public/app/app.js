
angular.module('userApp', ['appRoutes', 'userCtrl', 'userService', 'mainCtrlM', 'authService','emailCtrlM','managementM'])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');
  });
