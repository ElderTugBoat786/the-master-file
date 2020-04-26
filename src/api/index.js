const express = require('express');

const router = express.Router();

let mysql = require('mysql2');

require('dotenv').config();

var connection = mysql.createPool({
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
	connection.query('SELECT challenge.id,challenge.name,challenge.description,challenge.reward,challenge.level,challenge.created_at,users_challenges.completed_at,users_challenges.video_link,users_challenges.images_link,users_challenges.description AS user_challenge_description FROM challenge LEFT JOIN users_challenges ON challenge.id  = users_challenges.id_challenge AND users_challenges.id_user ='+req.user.id,function(err,rows){
		if (err) {
			res.json({
				error : 1,
				massage : 'error in db query',
				errordb : err
			})
		}else {
			res.json(rows)
		}
	})
})

router.post('/challenges/:id',(req,res) => {

	if (req.body.videolink == undefined && req.body.imagelink == undefined && req.body.description == undefined) {
		res.json({
			error : 1,
			message : 'Missing param'
		})
	}else {
		var query = 'INSERT INTO users_challenges SET id_user = '+req.user.id+', id_challenge = '+req.params.id
		if (req.body.videolink != undefined) {
			query += ' , video_link = "'+req.body.videolink+'"'
		}
		if (req.body.imagelink != undefined) {
			query += ' , images_link = "'+req.body.imagelink+'"'
		}
		if (req.body.description != undefined) {
			query += ' , description = "'+req.body.description+'"'
		}

		connection.query('SELECT * FROM users_challenges WHERE id_user = '+req.user.id+' AND id_challenge = '+req.params.id,(err,rows) => {
			if ( err ) {
				res.json({
					error : 1,
					message : 'error in db query',
					errodb : err
				})
			}else {
				if (rows.length) {
	        res.json({
						error : 1,
						message : 'user challenge already complete'
					})
	      }else {
					connection.query(query,(err,result) => {
						if ( err ) {
							res.json({
								error : 1,
								message : 'error in db query',
								errodb : err
							})
						}else {
							res.json({
								error : 0,
								message : 'update success'
							})
						}
					})
	      }
			}
		});
	}
})

router.patch('/challenges/:id',(req,res) => {

	if (req.body.videolink == undefined && req.body.imagelink == undefined && req.body.description == undefined) {
		res.json({ error : 1, message : 'Missing param' })
	}else {
		var query = 'UPDATE users_challenges SET ';
		var valueToUpdate = []
		if (req.body.videolink != undefined) {
			valueToUpdate.push(' video_link = "'+req.body.videolink+'"');
		}
		if (req.body.imagelink != undefined) {
			valueToUpdate.push(' images_link = "'+req.body.imagelink+'"');
		}
		if (req.body.description != undefined) {
			valueToUpdate.push(' description = "'+req.body.description+'"');
		}

		query += valueToUpdate.join()+' WHERE id_user = '+req.user.id+' AND id_challenge = '+req.params.id

		connection.query('SELECT * FROM users_challenges WHERE id_user = '+req.user.id+' AND id_challenge = '+req.params.id,(err,rows) => {
			if ( err ) {
				res.json({
					error : 1,
					message : 'error in db query',
					errodb : err
				})
			}else {
				if (!rows.length) {
	        res.json({
						error : 1,
						message : 'user challenge is not complete'
					})
	      }else {
					connection.query(query,(err,result) => {
						if ( err ) {
							res.json({
								error : 1,
								query: query,
								message : 'error in db query',
								errodb : err
							})
						}else {
							res.json({
								error : 0,
								message : 'update success'
							})
						}
					})
	      }
			}
		});
	}
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
