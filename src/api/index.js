const express = require('express');

const router = express.Router();

let mysql = require('mysql2');

require('dotenv').config();

var connection = mysql.createConnection({
				  host     : process.env.DB_HOST,
          port     : process.env.DB_PORT,
				  user     : process.env.DB_USER,
				  password : process.env.DB_PASS
				});

connection.query('USE '+process.env.DB_NAME);

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.get('/challenges',(req,res) => {
	connection.query('SELECT * FROM challenge LEFT JOIN users_challenges ON challenge.id  = users_challenges.id_challenge AND users_challenges.id_users ='+req.user.id,function(err,rows){
		if (err) {
			res.json({
				error : 1,
				massage : 'error in db query',
			})
		}else {
			res.json(rows)
		}
	})
})

router.get('/user',(req,res) => {
	connection.query('SELECT * FROM users WHERE id = '+req.user.id,function(err,rows){
		if (err) {
			res.json({
				error : 1,
				massage : 'error in db query'
			})
		}else {
			res.json(rows[0])
		}
	})
})

module.exports = router;
