let mysql = require('mysql2');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var connection = mysql.createConnection({
				  host     : process.env.DB_HOST,
          port     : process.env.DB_PORT,
				  user     : process.env.DB_USER,
				  password : process.env.DB_PASS
				});

connection.query('USE '+process.env.DB_NAME);


passport.serializeUser(function(user, done) {
	console.log(user);
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
  connection.query("select * from users where id = "+id,function(err,rows){
    done(err, rows[0]);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "' AND `password` = '" + password + "'",function(err,rows){
			if (err) return done(err);
			if (!rows.length) {
        return done(null, false, { message: 'Incorrect username.' }); // req.flash is the way to set flashdata using connect-flash
      }
      if (!( rows[0].password == password))
        return done(null, false, { message: 'Incorrect username.' }); // create the loginMessage and save it to session as flashdata
      return done(null, rows[0]);
		});
  }
));

module.exports = passport;
