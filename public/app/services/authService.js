
angular.module('authService', [])
  .factory('Auth', function ($http, AuthToken) {
    authFactory = {};
    authFactory.login = function (loginData) {
      return $http.post('/api/authenticate', loginData).then(function (response) {
        AuthToken.setToken(response.data.token);
        return response;
      });
    };
    authFactory.isLoggedIn = function () {
      if (AuthToken.getToken()) {
        return true;
      } else {
        return false;
      }
    };
    authFactory.facebook = function (token) {
      AuthToken.setToken(token);
    }

    authFactory.getUser = function () {
      if (AuthToken.getToken()) {
        return $http.post('/api/me');
      } else {
        $q.reject({ message: 'User has no token ' })
      }
    }
    authFactory.logout = function () {
      AuthToken.setToken();
    };
    return authFactory;

  })
  .factory('AuthToken', function ($window) {
    authTokenFactory = {};

    authTokenFactory.setToken = function (token) {
      if (token) {
        $window.localStorage.setItem('token', token);
      } else {
        $window.localStorage.removeItem('token', token);
      }
    };
    authTokenFactory.getToken = function (token) {
      return $window.localStorage.getItem('token');
    };
    return authTokenFactory;

  })
  .factory('AuthInterceptors', function (AuthToken) {
    authInterceptorsFactory = {};
    authInterceptorsFactory.request = function (config) {
      var token = AuthToken.getToken();
      if (token) config.headers['x-access-token'] = token;
      return config;
    };
    return authInterceptorsFactory;
  })
