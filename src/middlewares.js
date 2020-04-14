function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

function authHandler(req,res,next){
  if (!req.user) {
    res.status(401);
    res.json({
      message : 'User must be authenticated'
    })
  }

  next();
}


function allowAllCors(req,res,next){
  res.header('Access-Control-Allow-Origin' , '*' );
  next();
}

module.exports = {
  notFound,
  errorHandler,
  authHandler,
  allowAllCors
};
