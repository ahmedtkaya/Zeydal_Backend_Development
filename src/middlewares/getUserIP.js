const getUserIp = async (req, res, next) => {
  const ipAddress =
    req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];
  req.userIp = ipAddress;
  next();
};
export default getUserIp;
