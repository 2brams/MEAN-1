var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function (router) {

  var options = {
    auth: {
      api_user: '2brams',
      api_key: 'sg_07751672'
    }
  }
  var client = nodemailer.createTransport(sgTransport(options));

  router.post('/users', function (req, res) {
    var user = new User();
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
    if (req.body.username == null || req.body.username == '' ||
      req.body.name == null || req.body.name == '' ||
      req.body.password == null || req.body.password == '' ||
      req.body.email == null || req.body.email == '') {
      res.json({ success: false, message: 'Error champs' });
    } else {
      user.save(function name(err) {
        if (err) {
          if (err.errors != null) {
            if (err.errors.name) {
              res.json({ success: false, message: err.errors.name.message });
            } else if (err.errors.email) {
              res.json({ success: false, message: err.errors.email.message });
            } else {
              res.json({ success: false, message: err });
            }
          } else if (err) {
            if (err.code == 11000) {
              // console.log(err.errmsg.indexOf("email"))
              if (err.errmsg.indexOf("username") != -1) {
                res.json({ success: false, message: 'username already taken' });
              } else if (err.errmsg.indexOf("email" != -1)) {
                res.json({ success: false, message: 'e-mail already taken' });
              }
            } else {
              res.json({ success: false, message: err });
            }
          }
        } else {

          var email = {
            from: 'Localhost staff staff@localhost.com',
            to: user.email,
            subject: 'Localhost activation link',
            text: 'Hello' + user.name + 'Thank you for  registerring  at localhost.com, clik link. Activation: http://localhost:8000/activate/' + user.temporarytoken,
            html: 'Hello <b>' + user.name + '</b>,<br>Thank you for  registerring  at localhost.com, clik link. Activation: <br><br><a href="http://localhost:8000/activate/' + user.temporarytoken + '">http://localhost:8000/activate/</a>'
          };

          client.sendMail(email, function (err, info) {
            if (err) {
              console.log(err);
            }
            else {
              console.log('Message sent: ' + info.response);
            }
          });
          res.json({ success: true, message: 'Account registered! Please check you e-mail for activatin link.' });
        }
      });
    }
  });


  router.post('/checkusername', function (req, res) {
    User.findOne({ username: req.body.username }).select('username').exec(function (err, user) {
      if (err) throw err;

      if (user) {
        res.json({ success: false, message: 'Username is already taken' });
      } else {
        res.json({ success: true, message: 'Valide Username' });
      }
    });
  });
  router.post('/checkemail', function (req, res) {
    User.findOne({ email: req.body.email }).select('email').exec(function (err, user) {
      if (err) throw err;

      if (user) {
        res.json({ success: false, message: 'E-mail is already taken' });
      } else {
        res.json({ success: true, message: 'Valide E-mail' });
      }
    });
  });



  router.post('/authenticate', function (req, res) {
    User.findOne({ username: req.body.username }).select('email username password active').exec(function (err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Not auth user' });
      } else if (user) {
        if (req.body.password) {
          var validPassword = user.comparePassword(req.body.password)
        } else {
          res.json({ success: false, message: 'Not password pass' });
        }

        if (!validPassword) {
          res.json({ success: false, message: 'Not auth password' });
        } else if (!user.active) {
          res.json({ success: false, message: 'Account is not yet activated. Please check your e-mail for activation link', expired: true });
        } else {
          var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
          res.json({ success: true, message: 'auth!', token: token });
        }
      }
    })
  });

  router.put('/activate/:token', function (req, res) {
    User.findOne({ temporarytoken: req.params.token }, function (err, user) {
      if (err) throw err;
      var token = req.params.token;
      jwt.verify(token, secret, function (err, decoded) {
        if (err) {
          res.json({ success: false, message: 'Activation link has expired' });
        } else if (!user) {
          res.json({ success: false, message: 'Activation link has expired' });
        } else {
          user.temporarytoken = false;
          user.active = true;
          user.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              var email = {
                from: 'Localhost staff staff@localhost.com',
                to: user.email,
                subject: 'Localhost Account Activated',
                text: 'Hello' + user.name + 'You account has been succesfully activated',
                html: 'Hello <b>' + user.name + '</b>,You account has been succesfully activated!'
              };
              client.sendMail(email, function (err, info) {
                if (err) {
                  console.log(err);
                }
                else {
                  console.log('Message sent: ' + info.response);
                }
              });
              res.json({ success: true, message: 'Account activated!' });
            }
          });
        }
      });
    });
  });

  router.post('/resend', function (req, res) {
    User.findOne({ username: req.body.username }).select('username password active').exec(function (err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Not auth user' });
      } else if (user) {
        if (req.body.password) {
          var validPassword = user.comparePassword(req.body.password)
        } else {
          res.json({ success: false, message: 'Not password pass' });
        }

        if (!validPassword) {
          res.json({ success: false, message: 'Not auth password' });
        } else if (user.active) {
          res.json({ success: false, message: 'Account is already activated' });
        } else {
          res.json({ success: true, user: user });
        }
      }
    })
  });

  router.put('/resend', function (req, res) {
    User.findOne({ username: req.body.username }).select('username name email temporarytoken').exec(function (err, user) {
      if (err) throw err;
      user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
      user.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          var email = {
            from: 'Localhost staff staff@localhost.com',
            to: user.email,
            subject: 'Localhost activation link Request',
            text: 'Hello' + user.name + 'Thank you for  registerring  at localhost.com, clik link. Activation: http://localhost:8000/activate/' + user.temporarytoken,
            html: 'Hello <b>' + user.name + '</b>,<br>Thank you for  registerring  at localhost.com, clik link. Activation: <br><br><a href="http://localhost:8000/activate/' + user.temporarytoken + '">http://localhost:8000/activate/</a>'
          };

          client.sendMail(email, function (err, info) {
            if (err) {
              console.log(err);
            }
            else {
              console.log('Message sent: ' + info.response);
            }
          });
          res.json({ success: true, message: 'Activated link has been send to ' + user.email });
        }
      });
    });
  });

  router.get('/resetusername/:email', function (req, res) {
    User.findOne({ email: req.params.email }).select('email name username').exec(function (err, user) {

      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (!req.params.email) {
          res.json({ success: false, message: 'No e-mail was provided' });
        } else {
          if (!user) {
            res.json({ success: false, message: 'E-mail not found' });
          } else {
            var email = {
              from: 'Localhost staff staff@localhost.com',
              to: user.email,
              subject: 'Localhost Username Request',
              text: 'Hello' + user.name + ',You recently resquest you username, Please save it in your files:' + user.username,
              html: 'Hello <b>' + user.name + '</b>,<br>You recently resquest you username, Please save it in your files:' + user.username
            };

            client.sendMail(email, function (err, info) {
              if (err) {
                console.log(err);
              }
              else {
                console.log('Message sent: ' + info.response);
              }
            });
            res.json({ success: true, message: 'Username has been sent to e-mail' });
          };
        }

      }
    });
  });

  router.put('/resetpassword', function (req, res) {
    User.findOne({ username: req.body.username }).select('username active name email resettoken').exec(function (err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Username was not found' });
      } else if (!user.active) {
        res.json({ success: false, message: 'Account has not yet been active' });

      } else {
        user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        user.save(function (err) {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            var email = {
              from: 'Localhost staff staff@localhost.com',
              to: user.email,
              subject: 'Localhost Reset Password Request',
              text: 'Hello' + user.name + 'You recently request a password reset link.  Plase click on the link below to reset you password: <br><br><a href="http://localhost:8000/reset/' + user.resettoken,
              html: 'Hello <b>' + user.name + '</b>,<br>You recently requesta password reset link.  Plase click on the link below to reset you password: <br><br><a href="http://localhost:8000/reset/' + user.resettoken + '">http://localhost:8000/reset/</a>'
            };
            client.sendMail(email, function (err, info) {
              if (err) {
                console.log(err);
              }
              else {
                console.log('Message sent: ' + info.response);
              }
            });
            res.json({ success: true, message: 'Please check your e-mail forpassword reset link' });
          }
        });
      }

    });
  });


  router.get('/resetpassword/:token', function (req, res) {
    User.findOne({ resettoken: req.params.token }).select('email name username').exec(function (err, user) {
      if (err) throw err;
      var token = req.params.token;
      jwt.verify(token, secret, function (err, decoded) {
        if (err) {
          res.json({ success: false, message: 'Password link has expired!' });
        } else {
          if (!user) {
            res.json({ success: false, message: 'Password link has expired' });
          } else {
            res.json({ success: true, user: user });
          }
        }
      })
    });
  });


  router.put('/savepassword', function (req, res) {
    User.findOne({ username: req.body.username }).select('email password resettoken name username').exec(function (err, user) {
      if (err) throw err;
      if (req.body.password == null || req.body.password == '') {
        res.json({ success: false, message: 'Password not provided' });
      } else {
        user.password = req.body.password;
        user.resettoken = false;
        user.save(function (err) {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            var email = {
              from: 'Localhost staff staff@localhost.com',
              to: user.email,
              subject: 'Localhost Reset Password',
              text: 'Hello' + user.name + 'This e-mail is to notify you that you password was recently reset at localhost.com',
              html: 'Hello <b>' + user.name + '</b>,<br>This e-mail is to notify you that you password was recently reset at localhost.com'
            };
            client.sendMail(email, function (err, info) {
              if (err) {
                console.log(err);
              }
            });
            res.json({ success: true, message: 'Passwor has been reset!' });
          }
        });
      }
    });
  })

  router.use(function (req, res, next) {
    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, secret, function (err, decoded) {
        if (err) {
          res.json({ success: false, message: 'Token Invalid!' });
        } else {
          req.decoded = decoded;
          next();
        }
      })
    } else {
      res.json({ success: false, message: 'no token provided!' });
    }
  });

  router.post('/me', function (req, res) {
    res.send(req.decoded);
  });
  router.get('/renewToken/:username', function (req, res) {
    User.findOne({ username: req.params.username }).select('email name username').exec(function (err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'No user found' });
      } else {
        var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        res.json({ success: true, token: newToken });
      }

    });
  });
  router.get('/permission', function (req, res) {
    User.findOne({ username: req.decoded.username }, function (err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'No user found' });
      } else {
        res.json({ success: true, permission: user.permission });
      }

    });
  });
  router.get('/management', function (req, res) {
    User.find({}, function (err, users) {
      if (err) throw err;
      User.findOne({ username: req.decoded.username }, function (err, mainUser) {
        if (err) throw err;
        if (!mainUser) {
          res.json({ success: false, message: 'No user found' });
        } else {
          if (mainUser.permission == 'admin' || mainUser.permission == 'moderator') {
            if (!users) {
              res.json({ success: false, message: 'No users found' });
            } else {
              res.json({ success: true, users: users, permission: mainUser.permission });
            }
          } else {
            res.json({ success: false, message: 'Insufficient Permisssion' });
          }

        }
      });
    });
  });

  router.delete('/management/:username', function (req, res) {
    var deletedUser = req.params.username;
    User.findOne({ username: req.decoded.username }, function (err, mainUser) {
      if (err) throw err;
      if (!mainUser) {
        res.json({ success: false, message: 'No user found' });
      } else {
        if (mainUser.permission !== 'admin') {
          res.json({ success: false, message: 'Insufficient Permission' });
        } else {
          User.findOneAndRemove({ username: deletedUser }, function (err, user) {
            if (err) throw err;
            res.json({ success: true });
          });
        }
      }
    });
  });
  router.get('/edit/:id', function (req, res) {
    var editUser = req.params.id;
    User.findOne({ username: req.decoded.username }, function (err, mainUser) {
      if (err) throw err;
      if (!mainUser) {
        res.json({ success: false, message: 'No user found' });
      } else {
        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
          User.findOne({ _id: editUser }, function (err, user) {
            if (err) throw err;
            if (!user) {
              res.json({ success: false, message: 'No user found' });
            } else {

              res.json({ success: true, user: user });
            }
          });
        } else {
          res.json({ success: false, message: 'Insufficient Permission' });
        }
      }
    });
  });

  router.put('/edit', function (req, res) {
    var editUser = req.body._id;
    if (req.body.name) var newName = req.body.name;
    if (req.body.username) var newUsername = req.body.username;
    if (req.body.email) var newEmail = req.body.email;
    if (req.body.permission) var newPermission = req.body.permission;
    User.findOne({ username: req.decoded.username }, function (err, mainUser) {
      if (err) throw err;
      if (!mainUser) {
        res.json({ success: false, message: 'No user found' });
      } else {
        if (newName) {
          if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
            User.findOne({ _id: editUser }, function (err, user) {
              if (err) throw err;
              if (!user) {
                res.json({ success: false, message: 'No user found' });
              } else {
                user.name = newName;
                user.save(function (err) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.json({ success: true, message: 'Name has been updated!' });
                  }
                });
              }
            });
          } else {
            res.json({ success: false, message: 'Insufficient Permission' });
          }
        }
        if (newPermission) {
          if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
            User.findOne({ _id: editUser }, function (err, user) {
              if (err) throw err;
              if (!user) {
                res.json({ success: false, message: 'No user found' });
              } else {
                if (newPermission === 'user' || newPermission === 'moderator') {
                  if (user.permission === 'admin') {
                    if (mainUser.permission !== 'admin') {
                      res.json({ success: false, message: 'You must be an admin to downgrade another admin' });
                    } else {
                      user.permission = newPermission;
                      user.save(function (err) {
                        if (err) {
                          console.log(err);
                        } else {
                          res.json({ success: true, message: 'Permission has been updated!' });
                        }
                      });
                    }
                  } else {
                    user.permission = newPermission;
                    user.save(function (err) {
                      if (err) {
                        console.log(err);
                      } else {
                        res.json({ success: true, message: 'Permission has been updated!' });
                      }
                    });
                  }
                }
                if (newPermission === 'admin') {
                  if (mainUser.permission === 'admin') {
                    user.permission = newPermission;
                    user.save(function (err) {
                      if (err) {
                        console.log(err);
                      } else {
                        res.json({ success: true, message: 'Permission has been updated!' });
                      }
                    });
                  } else {
                    res.json({ success: false, message: 'You must be an admin to upgrade another admin' });
                  }
                }
              }
            });
          } else {
            res.json({ success: false, message: 'Insufficient Permission' });
          }
        }
      }
    });
  });

  return router;
}