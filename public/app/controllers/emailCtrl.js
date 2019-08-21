angular.module('emailCtrlM', ['userService'])
  .controller('emailCtrl', function ($routeParams, User, $timeout, $location) {
    app = this;
    User.activeAccount($routeParams.token).then(function (response) {
      app.successMsg = false;
      app.errorMsg = false;
      console.log(response);
      if (response.data.success) {
        app.successMsg = response.data.message + '...Redirecting';
        $timeout(function () {
          $location.path('/login')
        }, 2000)
      } else {
        app.errorMsg = response.data.message;
      }

    });
  }).controller('resendCtrl', function (User) {
    app = this;
    app.errorMsg = false;
    app.successMsg = false;
    app.checkCredentials = function (loginData) {
      User.checkCredentials(app.loginData).then(function (response) {
        if (response.data.success) {
          // console.log(response);
          User.resendLink(app.loginData).then(function (response) {
            if (response.data.success) {
              app.successMsg = response.data.message;
            }
          })
        } else {
          app.errorMsg = response.data.message;
        }
      });

    };
  })
  .controller('usernameCtrl', function (User) {
    app = this;
    app.sendUsername = function (resetData, valid) {
      app.errorMsg = false;
      if (valid) {
        User.sendUsername(app.resetData.email).then(function (response) {
          console.log(response);
          if (response.data.success) {
            app.successMsg = response.data.message;
          } else {
            app.errorMsg = response.data.message;
          }
        });
      } else {
        app.errorMsg = 'Please enter valid e-mail';
      }
    };
  })
  .controller('passwordCtrl', function (User) {
    app = this;
    app.sendPassword = function (resetData, valid) {
      app.errorMsg = false;
      if (valid) {
        User.sendPassword(app.resetData).then(function (response) {
          console.log(response);
          if (response.data.success) {
            app.successMsg = response.data.message;
          } else {
            app.errorMsg = response.data.message;
          }
        });
      } else {
        app.errorMsg = 'Please enter valid Username';
      }
    };
  })
  .controller('resetCtrl', function ($routeParams, User, $scope, $timeout, $location) {
    app = this;
    app.hide = true;
    User.resetUser($routeParams.token).then(function (response) {
      if (response.data.success) {
        app.hide = false;
        app.successMsg = 'Enter a new password';
        $scope.username = response.data.user.username;
      } else {
        app.errorMsg = response.data.message;
      }
    });
    app.savePassword = function (regData, valid, confirmed) {
      app.errorMsg = false;
      app.disabled = true;
      if (valid && confirmed) {
        app.regData.username = $scope.username;
        User.savePassword(app.regData).then(function (response) {
          if (response.data.success) {
            app.successMsg = response.data.message + '....Redirecting';
            $timeout(function () {
              $location.path('/login')
            }, 2000)
          } else {
            app.errorMsg = response.data.message;
          }
        })
      } else {
        app.disabled = false;
        app.errorMsg = 'Please ensure form is filled out properly';
      }
    }
  });