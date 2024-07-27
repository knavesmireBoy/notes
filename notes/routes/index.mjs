import * as express from "express";
import { NotesStore as notes } from "../models/notes-store.mjs";
import { twitterLogin } from "./users.mjs";
import { io } from "../app.mjs";
import { default as DBG } from "debug";
export const router = express.Router();
const debug = DBG("notes:debug");

/* GET home page. */

router.get("/", async (req, res, next) => {
  try {
    const notelist = await getKeyTitlesList();
    res.render("index", {
      title: "Notes",
      notelist: notelist,
      user: req.user ? req.user : undefined,
      twitterLogin: twitterLogin,
    });
  } catch (e) {
    next(e);
  }
});
async function getKeyTitlesList() {
  const keylist = await notes.keylist(),
  keyPromises = keylist.map((key) => notes.read(key)),
  notelist = await Promise.all(keyPromises);
  return notelist.map((note) => {
    return { key: note.key, title: note.title };
  });
}
const emitNoteTitles = async () => {
  const notelist = await getKeyTitlesList();
  console.log('so emit alrweady');
  //io.of('/').emit('notetitles', { notelist });
  io.emit('notetitles', { notelist });
};
export function init() {
  io.of('/').on('connect', socket => {
      debug('socketio connection on /home');
  });
  notes.on('notecreated', emitNoteTitles);
  notes.on('noteupdated', emitNoteTitles);
  notes.on('notedestroyed', emitNoteTitles);
}