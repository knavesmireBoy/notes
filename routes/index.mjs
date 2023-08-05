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

const emitNoteTitles = async (...args) => {
  const notelist = await getKeyTitlesList();
  //io.emit("notetitles", { notelist });
  console.log('HO', ...args);
  io.of("/home").emit("notetitles", { notelist });
};

export function init() {

  io.of("/home").on("connect", (socket) => {
    debug("socketio connection on /home");
    /*
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
    */
  });

/*
  io.on("connect", (socket) => {
    debug("socketio connection on /home");
  });
  */
 
  notes.on("notecreated", emitNoteTitles);
  notes.on("noteupdate", emitNoteTitles);
  notes.on("notedestroy", emitNoteTitles);
  
}
