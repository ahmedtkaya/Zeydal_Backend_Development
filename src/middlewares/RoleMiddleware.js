import User from "../db/users";

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Assuming the user ID is stored in req.user.id by the authentication middleware
      const userId = req.user.id;

      // Fetch the user from the database
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json("User not found.");
      }

      // Check if the user's role is in the allowed roles
      if (roles.includes(user.role)) {
        next();
      } else {
        return res.status(401).json("You cannot get in.");
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
};

export default checkRole;
