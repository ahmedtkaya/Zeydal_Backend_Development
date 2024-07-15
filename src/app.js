import "express-async-errors";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import dotenv from "dotenv";
import config from "../src/config";
import express from "express";
import logger from "morgan";
import fs from "fs";
import https from "https";
import path from "path";
import GenericErrorHandler from "./middlewares/GenericErrorHandler";
import ApiError from "./errors/ApiError";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import Session from "./middlewares/Session";
import routes from "./routes/index";
import DBModels from "./db/index";
import Users from "./db/users";

const envPath = config?.production ? "./env/.prod" : "./env/.dev";
dotenv.config({
  path: envPath,
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected on mongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
const router = express.Router();

app.use(logger(process.env.LOGGER));
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(
  express.json({
    limit: "1mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((id, done) => {
  done(null, id);
});

app.use(passport.initialize());

const jwtOps = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOps, async (jwtPayload, done) => {
    try {
      const user = await Users.findOne({ _id: jwtPayload._id });
      if (user) {
        done(null, user.toJSON());
      } else {
        done(
          new ApiError(
            "Authorization is not valid",
            401,
            "authorizationInvalid"
          ),
          false
        );
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
routes.forEach((routeFunc, index) => {
  routeFunc(router);
});

app.use("/api", router);

app.all("/test-auth", Session, (req, res) => {
  res.json({
    test: true,
  });
});

app.use(GenericErrorHandler);

if (process.env.HTTPS_ENABLED === "true") {
  const key = fs
    .readFileSync(path.join(__dirname, "./certs/key.pem"))
    .toString();
  const cert = fs
    .readFileSync(path.join(__dirname, "./certs/cert.pem"))
    .toString();
  const server = https.createServer({ key: key, cert: cert }, app);

  server.listen(process.env.PORT, () => {
    console.log(`Application is running on port =  ${process.env.PORT}`);
  });
} else {
  app.listen(process.env.PORT, () => {
    console.log(`Application is running on port =  ${process.env.PORT}`);
  });
}
