const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

let mysql = require('mysql2');

var session = require("express-session");
var flash = require('connect-flash');


var bodyParser = require('body-parser')

const middlewares = require('./middlewares');
const api = require('./api');

require('dotenv').config();

var passport = require('./passport/setup')

const app = express();

var connection = mysql.createPool({
				  host     : process.env.DB_HOST,
          port     : process.env.DB_PORT,
				  user     : process.env.DB_USER,
				  password : process.env.DB_PASS
				});

connection.query('USE '+process.env.DB_NAME);

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true
  }));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(morgan('dev'));
app.use(helmet());
// app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use(middlewares.allowAllCors);

app.post('/login',
  passport.authenticate('local',{failureFlash: true }),
  function(req, res) {
    res.status(200);
    res.json({
      user : {
        id : req.user.id,
        username: req.user.username,
      },
      auth : true
    })
  });

app.post('/register',(req,res) => {
	if (req.body.username == undefined || req.body.password == undefined || req.body.email == undefined ) {
		res.json({
			'error' : 1,
			'message' : 'Missing some parameter'
		})
	}else {
		connection.query('SELECT * FROM users where username = "'+req.body.username+'"',(err,rows) => {
			if (err) return res.json({error:err});

			if (rows.length == 0) {
				connection.query('INSERT INTO users (username,password,email,avatar,score,active,level_id,admin) VALUES ("'+
														req.body.username+'","'+
														req.body.password+'","'+
														req.body.email+'","'+
														(req.body.avatar == undefined ? 0 : req.body.avatar)+'",0,0,0,0)',(err,result) => {
					if (err) {
						res.json({error:err});
					}else {
						res.json({
							message : 'user created'
						})
					}
				})
			}else {
				res.json({
					error: 1,
					messagge: 'username already exists'
				})
			}
		})

	}
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.use(middlewares.authHandler);

app.get('/',(req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  });
});

app.use('/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);


module.exports = app;
