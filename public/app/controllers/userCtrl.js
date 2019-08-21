
angular.module('userCtrl', ['userService',])
  .controller('regCtrl', function ($http, $location, User, $timeout) {

    var app = this;
    this.regUser = function (regData, valid, confirmed) {
      app.loading = true;
      app.errorMsg = false;
      // console.log(this.regData);
      if (valid && confirmed) {
        User.create(app.regData).then(function (response) {
          // console.log(response.data);
          app.loading = false;
          if (response.data.success) {
            app.successMsg = response.data.message;
            // $timeout(function () {
            //   $location.path('/')
            // }, 2000)
          } else {
            app.loading = false;
            app.errorMsg = response.data.message;
          }
        });
      } else {
        app.loading = false;
        app.errorMsg = "Please form not valid";
      }
    };

    this.checkUsername = function (regData) {
      app.checkInUsername = true;
      app.usernameMsg = false;
      app.usernameInvalid = false;

      User.checkUsername(app.regData).then(function (data) {
        if (data.data.success) {
          app.checkInUsername = false;
          app.usernameInvalid = false;
          app.usernameMsg = data.data.message;
        } else {
          app.checkInUsername = false;
          app.usernameInvalid = true;
          app.usernameMsg = data.data.message;
        }
      });
    }
    this.checkEmail = function (regData) {
      app.checkInEmail = true;
      app.emailMsg = false;
      app.emailInvalid = false;

      User.checkEmail(app.regData).then(function (data) {
        if (data.data.success) {
          app.checkInEmail = false;
          app.emailInvalid = false;
          app.emailMsg = data.data.message;
        } else {
          app.checkInEmail = false;
          app.emailInvalid = true;
          app.emailMsg = data.data.message;
        }
      });
    }
  })
  .directive('match', function () {
    return {
      restrict: 'A',
      controller: function ($scope) {

        $scope.confirmed = false;

        $scope.doConfirm = function (values) {
          values.forEach(function (element) {
            if (element == $scope.confirm) {
              $scope.confirmed = true;
            } else {
              $scope.confirmed = false;
            }
          });
        }
      },
      link: function (scope, element, attrs) {
        attrs.$observe('match', function () {
          scope.matches = JSON.parse(attrs.match)
          scope.doConfirm(scope.matches);
        });
        scope.$watch('confirm', function () {
          scope.matches = JSON.parse(attrs.match)
          scope.doConfirm(scope.matches);
        })

      }
    };
  })
  .controller('facebookCtrl', function ($routeParams, Auth, $location, $window, $timeout) {

    var app = this;
    app.errorMsg = false;
    if ($window.location.pathname == '/facebookerror') {
      app.errorMsg = 'facebook email not found in database.';
    } else if ($window.location.pathname == '/facebook/inactive/error') {
      app.expired = true;
      app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link';
    } else {
      Auth.facebook($routeParams.token);
      $location.path('/');
    }
  })
  .controller('twitterCtrl', function ($routeParams, Auth, $location, $window) {

    var app = this;
    app.errorMsg = false;
    app.expired = false;
    if ($window.location.pathname == '/twittererror') {
      app.errorMsg = 'twitter email not found in database.';
    } else if ($window.location.pathname == '/twitter/inactive/error') {
      app.expired = true;
      app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link';
    } else {
      Auth.facebook($routeParams.token);
      // $window.location.href('/');
      $location.path('/');
    }
  })
  .controller('googleCtrl', function ($routeParams, Auth, $location, $window) {

    var app = this;
    app.errorMsg = false;
    if ($window.location.pathname == '/googleerror') {
      app.errorMsg = 'Google email not found in database.';
    } else if ($window.location.pathname == '/google/inactive/error') {
      app.expired = true;
      app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link';
    } else {
      Auth.facebook($routeParams.token);
      $location.path('/');
    }
  });

