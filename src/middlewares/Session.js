import passport from "passport";

const Session = passport.authenticate("jwt", { session: false });

export default Session;
