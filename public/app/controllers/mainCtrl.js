
angular.module('mainCtrlM', ['authService', 'userService'])
  .controller('mainCtrl', function (Auth, $location, $timeout, $rootScope, $window, $interval, $route, User, AuthToken) {
    var app = this;
    app.loadme = false;

    app.checkSession = function () {
      if (Auth.isLoggedIn()) {
        app.checkingSession = true;
        var interval = $interval(function () {
          var token = $window.localStorage.getItem('token');
          if (token === null) {
            $interval.cancel(interval);
          } else {
            self.parseJwt = function (token) {
              var base64Url = token.split('.')[1];
              var base64 = base64Url.replace('-', '+').replace('_', '/');
              return JSON.parse($window.atob(base64));
            }
            var expireTime = self.parseJwt(token);
            var timeStamp = Math.floor(Date.now() / 1000);
            // console.log(expireTime.exp);
            // console.log(timeStamp);
            var timeCheck = expireTime.exp - timeStamp;
            // console.log('timeCheck: ' + timeCheck);
            if (timeCheck <= 25) {
              // console.log('token has expired ');
              showModal(1);
              $interval.cancel(interval);
            } else {
              // console.log('token not yet expired ');

            }
          }
        }, 2000);
      }
    };

    app.checkSession();

    var showModal = function (option) {
      app.choiceMade = false;
      app.modalHeader = undefined;
      app.modalBody = undefined;
      app.hideButton = false;
      if (option == 1) {
        app.modalHeader = 'Timeout Warning';
        app.modalBody = 'You session will expired in 5 minutes. Would you like to renew your session?';
        $("#myModal").modal({ backdrop: "static" });
      } else if (option == 2) {
        app.hideButton = true;
        app.modalHeader = 'Logging Out';
        $("#myModal").modal({ backdrop: "static" });
        $timeout(function () {
          Auth.logout();
          $location.path('/')
          hideModal();
          $window.location.reload();
          // $route.reload();
        }, 2000);
      }
      $timeout(function () {
        if (!app.choiceMade) {
          hideModal();
        }
      }, 4000);
    };
    var hideModal = function () {
      $("#myModal").modal('hide');
    };
    app.renewSession = function () {
      app.choiceMade = true;

      User.renewSession(app.username).then(function (response) {
        if (response.data.success) {
          AuthToken.setToken(response.data.token);
          app.checkSession();
        } else {
          app.modalBody = response.data.message;
        }
      });
      hideModal();
    };
    app.endSession = function () {
      app.choiceMade = true;
      hideModal();
      $timeout(function () {
        showModal(2);
      }, 1000);
    };
    $rootScope.$on('$routeChangeStart', function () {
      if (!app.checkSession) {
        app.checkSession();
      }
      // console.log('avant');
      if (Auth.isLoggedIn()) {
        app.isLoggedIn = true;
        Auth.getUser().then(function (response) {
          app.username = response.data.username;
          app.useremail = response.data.email;

          User.getPermission().then(function (response) {
            if (response.data.permission == 'admin' || response.data.permission == 'moderator') {
              app.authorized = true;
              app.loadme = true;
            }else{
              app.loadme = true;
            }
          });

        });
      } else {
        app.isLoggedIn = false;
        app.username = '';
        app.loadme = true;
      }
      if ($location.hash() == '_=_') $location.hash(null);
    });
    this.facebook = function () {
      $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
    }
    this.twitter = function () {
      $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
    }
    this.google = function () {
      $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
    }

    this.doLogin = function (loginData) {
      app.loading = true;
      app.errorMsg = false;
      app.expired = false;
      app.disabled = true;
      Auth.login(app.loginData).then(function (response) {
        if (response.data.success) {
          app.loading = false;
          app.successMsg = response.data.message
          $timeout(function () {
            $location.path('/')
            app.loginData = '';
            app.successMsg = false;
            app.checkSession();
          }, 2000);

        } else {
          if (response.data.expired) {
            app.expired = true;
            app.loading = false;
            app.errorMsg = response.data.message
          } else {
            app.loading = false;
            app.disabled = true;
            app.errorMsg = response.data.message
          }

        }
      }, function (response) {
        console.log(response);
      })
    };
    app.logout = function () {
      showModal(2);
    }

  });

