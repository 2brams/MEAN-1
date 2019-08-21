angular.module('managementM', ['userService'])
  .controller('managementCtrl', function (User, $scope) {

    var app = this;
    app.loading = true;
    app.accessDenied = true;
    app.errorMsg = false;
    app.editAccess = false;
    app.deleteAccess = false;
    app.limit = 2;
    app.searchLimit = 0;

    function getUsers() {
      User.getUsers().then(function (response) {
        if (response.data.success) {
          if (response.data.permission == 'admin' || response.data.permission == 'moderator') {
            app.users = response.data.users;
            app.loading = false;
            app.accessDenied = false;
            if (response.data.permission == 'admin') {
              app.editAccess = true;
              app.deleteAccess = true;
            } else if (response.data.permission == 'moderator') {
              app.editAccess = true;
            }
          } else {
            app.errorMsg = 'Insufficient Permission';
            app.loading = false;
          }
        } else {
          app.errorMsg = response.data.message;
          app.loading = false;
        }
      });
    }
    getUsers();

    app.showMore = function (number) {
      app.showMoreError = false;
      if (number > 0) {
        app.limit = number;
      } else {
        app.showMoreError = 'Please enter a valid nuber';
      }
    };
    app.showAll = function () {
      app.limit = undefined;
      app.showMoreError = false;
    };

    app.deleteUser = function (username) {
      User.deleteUser(username).then(function (response) {
        if (response.data.success) {
          getUsers();
        } else {
          app.showMoreError = response.data.message;
        }
      });
    }

    app.search = function (searchKeyword, number) {
      if (searchKeyword) {
        if (searchKeyword.length > 0) {
          app.limit = 0;
          $scope.searchFilter = searchKeyword;
          app.limit = number;
        } else {
          $scope.searchFilter = undefined;
          app.limit = 0;
        }
      } else {
        $scope.searchFilter = undefined;
        app.limit = 0;
      }
    };
    app.clear = function () {
      $scope.number = 'clear';
      app.limit = 0;
      $scope.searchKeyword = undefined;
      $scope.searchFilter = undefined;
      app.showMoreError = false;
    };
    app.advancedSearch = function (searchByUsername, searchByEmail, searchByName) {
      if (searchByUsername || searchByEmail || searchByName) {
        $scope.advancedSearchFilter = {};
        if (searchByUsername) {
          $scope.advancedSearchFilter.username = searchByUsername;
        }
        if (searchByEmail) {
          $scope.advancedSearchFilter.email = searchByEmail;
        }
        if (searchByName) {
          $scope.advancedSearchFilter.name = searchByName;
        }
        app.searchLimit = undefined;
      }
    };
    app.sortOrder = function (order) {
      app.sort = order;
    };
  })
  .controller('editCtrl', function ($scope, $routeParams, User, $timeout) {

    var app = this;
    $scope.nameTab = 'active';
    app.phase1 = true;

    User.getUser($routeParams.id).then(function (response) {
      if (response.data.success) {
        $scope.newName = response.data.user.name;
        app.currentUser = response.data.user._id;
      } else {
        app.errorMsg = response.data.message;
      }
    })

    app.namePhase = function () {
      $scope.nameTab = 'active';
      $scope.usernameTab = 'default';
      $scope.emailTab = 'default';
      $scope.permissionsTab = 'default';
      app.phase1 = true;
      app.phase2 = false;
      app.phase3 = false;
      app.phase4 = false;
    };

    app.usernamePhase = function () {
      $scope.nameTab = 'default';
      $scope.usernameTab = 'active';
      $scope.emailTab = 'default';
      $scope.permissionsTab = 'default';
      app.phase1 = false;
    };

    app.emailPhase = function () {
      $scope.nameTab = 'default';
      $scope.usernameTab = 'default';
      $scope.emailTab = 'active';
      $scope.permissionsTab = 'default';
      app.phase1 = false;
    };

    app.permissionsPhase = function () {
      $scope.nameTab = 'default';
      $scope.usernameTab = 'default';
      $scope.emailTab = 'default';
      $scope.permissionsTab = 'active';
      app.phase1 = false;
    };

    app.updateName = function (newName, valid) {
      app.errorMsg = false;
      var userObject = {};

      if (valid) {
        userObject._id = app.currentUser;
        userObject.name = $scope.newName;
        User.editUser(userObject).then(function (response) {
          if (response.data.success) {
            app.successMsg = response.data.message;
            $timeout(function () {
              app.nameForm.name.$setPristine();
              app.nameForm.name.$setUntouched();
              app.successMsg = false;
            }, 2000);
          } else {
            app.errorMsg = response.data.message;
          }
        });
      } else {
        app.errorMsg = 'Please ensure form is filled out properly';
      }
    };
    app.updatePermision = function (newPermission, valid) {
      app.errorMsg = false;
      var userObject = {};

      if (valid) {
        userObject._id = app.currentUser;
        userObject.name = $scope.newName;
        User.editUser(userObject).then(function (response) {
          if (response.data.success) {
            app.successMsg = response.data.message;
            $timeout(function () {
              app.nameForm.name.$setPristine();
              app.nameForm.name.$setUntouched();
              app.successMsg = false;
            }, 2000);
          } else {
            app.errorMsg = response.data.message;
          }
        });
      } else {
        app.errorMsg = 'Please ensure form is filled out properly';
      }
    };

  });