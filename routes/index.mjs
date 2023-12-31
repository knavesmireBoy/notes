import { default as express } from "express";
import { io } from "../app.mjs";
import { NotesStore as notes } from "../models/notes-store.mjs";
import { default as DBG } from "debug";
const debug = DBG("notes:debug");
export const router = express.Router();

async function getKeyTitlesList() {
  const keylist = await notes.keylist();
  const keyPromises = keylist.map((key) => notes.read(key));
  const notelist = await Promise.all(keyPromises);
  return notelist.map((note) => {
    return { key: note.key, title: note.title };
  });
}

router.get("/", async (req, res, next) => {
  try {
    const notelist = await getKeyTitlesList();
    res.render("index", {
      title: "Notes",
      notelist: notelist,
      user: req.user ? req.user : undefined,
    });
  } catch (e) {
    next(e);
  }
});

export const emitNoteTitles = async (...args) => {
  const notelist = await getKeyTitlesList();
  io.of("/home").emit("notetitles", { notelist });
};

export function init() {

  io.of("/home").on("connect", (socket) => {
    debug("socketio connection on /home");
  });
  notes.on("notecreated", emitNoteTitles);
  notes.on("noteupdated", emitNoteTitles);
  notes.on("notedestroyed", emitNoteTitles);
  
}
