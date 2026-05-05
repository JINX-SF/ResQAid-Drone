const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // allow access
  } else {
    return res.status(403).json({ message: "Not authorized" });
  }
};

module.exports = adminOnly;