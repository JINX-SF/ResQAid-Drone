module.exports = (req, res, next) => {
  next(new Error(`Route not found : ${req.method} ${req.originalUrl}`));
};