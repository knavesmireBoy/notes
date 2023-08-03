import { default as express } from "express";
import hbs from "hbs";
import * as path from "path";
// import * as favicon from 'serve-favicon';
import { default as logger } from "morgan";
import rfs from "rotating-file-stream";
import { default as DBG } from "debug";
const debug = DBG("notes:debug");
const dbgerror = DBG("notes:error");
import { default as cookieParser } from "cookie-parser";
import { default as bodyParser } from "body-parser";
import * as http from "http";
import approotdir from "./approotdir.mjs";
const __dirname = approotdir;
import {
  normalizePort,
  onError,
  onListening,
  handle404,
  basicErrorHandler,
} from "./appsupport.mjs";

import dotenv from "dotenv/config.js";

import { router as indexRouter, init as homeInit } from "./routes/index.mjs";
import { router as notesRouter, init as notesInit } from "./routes/notes.mjs";
import { router as usersRouter, initPassport } from "./routes/users.mjs";

import socketio from "socket.io";
import passportSocketIo from "passport.socketio";
import session from "express-session";
import sessionFileStore from "session-file-store";
const FileStore = sessionFileStore(session);
export const sessionCookieName = "notescookie.sid";
const sessionSecret = "keyboard mouse";
const sessionStore = new FileStore({ path: "sessions" });

import { useModel as useNotesModel } from "./models/notes-store.mjs";

useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : "fs")
  .then((store) => {
    homeInit();
    notesInit();
  })
  .catch((error) => {
    onError({ code: "ENOTESSTORE", error });
  });

function fixpath(pth, ...rest) {
  app.use(pth, express.static(path.join(__dirname, ...rest)));
}

export const app = express();
export const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

export const server = http.createServer(app);

server.listen(port);
server.on("request", (req, res) => {
  debug(`${new Date().toISOString()} request ${req.method}
    ${req.url}`);
});
server.on("error", onError);
server.on("listening", onListening);

export const io = socketio(server);
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: sessionCookieName,
    secret: sessionSecret,
    store: sessionStore,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "partials"));
//app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(
  logger(process.env.REQUEST_LOG_FORMAT || "dev", {
    stream: process.env.REQUEST_LOG_FILE
      ? rfs.createStream(process.env.REQUEST_LOG_FILE, {
          size: "10M", // rotate every 10 MegaBytes written
          interval: "1d", // rotate daily
          compress: "gzip", // compress rotated files
        })
      : process.stdout,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    store: sessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    name: sessionCookieName,
  })
);
initPassport(app);

app.use(express.static(path.join(__dirname, "public")));

fixpath(
  "/assets/vendor/bootstrap/js",
  "node_modules",
  "bootstrap",
  "dist",
  "js"
);
fixpath("/assets/vendor/bootstrap/css", "minty");
app.use(
  "/assets/vendor/jquery",
  express.static(path.join(__dirname, "node_modules", "jquery", "dist"))
);
app.use(
  "/assets/vendor/popper.js",
  express.static(
    path.join(__dirname, "node_modules", "popper.js", "dist", "umd")
  )
);
app.use(
  "/assets/vendor/feather-icons",
  express.static(path.join(__dirname, "node_modules", "feather-icons", "dist"))
);
// Router function lists
app.use("/", indexRouter);
app.use("/notes", notesRouter);
app.use("/users", usersRouter);
// error handlers
// catch 404 and forward to error handler
app.use(handle404);
app.use(basicErrorHandler);
