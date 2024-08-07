// const util = require('util');
import { default as express } from "express";
import { NotesStore as notes } from "../models/notes-store.mjs";
import { ensureAuthenticated } from "./users.mjs";
import { twitterLogin } from "./users.mjs";
import { emitNoteTitles } from "./index.mjs";
import { io } from "../app.mjs";

export const router = express.Router();

export function init() {
  io.of("/notes").on("connect", (socket) => {
    if (socket.handshake.query.key) {
      socket.join(socket.handshake.query.key);
    }
  });
  notes.on("noteupdated", (note) => {
    const toemit = {
      key: note.key,
      title: note.title,
      body: note.body,
    };
    io.of("/notes").to(note.key).emit("noteupdated", toemit);
    emitNoteTitles();
  });
  notes.on("notedestroyed", (key) => {
    io.of("/notes").to(key).emit("notedestroyed", key);
    emitNoteTitles();
  });
}
  io.of("/notes").on("connect", (socket) => {
    if (socket.handshake.query.key) {
      socket.join(socket.handshake.query.key);
    }
  });
  notes.on("noteupdated", (note) => {
    const toemit = {
      key: note.key,
      title: note.title,
      body: note.body,
    };
    io.of("/notes").to(note.key).emit("noteupdated", toemit);
    emitNoteTitles();
  });
  notes.on("notedestroyed", (key) => {
    io.of("/notes").to(key).emit("notedestroyed", key);
    emitNoteTitles();
  });

// Add Note.
router.get("/add", ensureAuthenticated, (req, res, next) => {
  res.render("noteedit", {
    title: "Add a Note",
    docreate: true,
    notekey: "",
    note: undefined,
    user: req.user,
    note: undefined,
    twitterLogin: twitterLogin,
    user: req.user,
    note: undefined,
    twitterLogin: twitterLogin,
  });
});
// Save Note (update)
router.post("/save", ensureAuthenticated, async (req, res, next) => {
  try {
    let note;
    if (req.body.docreate === "create") {
      note = await notes.create(
        req.body.notekey,
        req.body.title,
        req.body.body
      );
    } else {
      note = await notes.update(
        req.body.notekey,
        req.body.title,
        req.body.body
      );
    }
    res.redirect("/notes/view?key=" + req.body.notekey);
  } catch (err) {
    next(err);
  }
});

// Read Note (read)
router.get("/view", async (req, res, next) => {
  try {
    let note = await notes.read(req.query.key);
    res.render("noteview", {
      title: note ? note.title : "",
      notekey: req.query.key,
      note: note,
      user: req.user ? req.user : undefined,
      twitterLogin: twitterLogin,
      twitterLogin: twitterLogin,
    });
  } catch (err) {
    next(err);
  }
});

// Edit note (update)
router.get("/edit", ensureAuthenticated, async (req, res, next) => {
  try {
    const k = req.query.key.trim(),
      note = await notes.read(k);
      note = await notes.read(k);

    res.render("noteedit", {
      title: note ? "Edit " + note.title : "Add a Note",
      docreate: false,
      notekey: k,
      note: note,
      user: req.user,
      twitterLogin: twitterLogin,
      twitterLogin: twitterLogin,
    });
  } catch (err) {
    next(err);
  }
});

// Ask to Delete note (destroy)
router.get("/destroy", ensureAuthenticated, async (req, res, next) => {
  try {
    const note = await notes.read(req.query.key);
    res.render("notedestroy", {
      title: note ? `Delete ${note.title}` : "",
      notekey: req.query.key,
      note: note,
      user: req.user,
      twitterLogin: twitterLogin,
      twitterLogin: twitterLogin,
    });
  } catch (err) {
    next(err);
  }
});
// Really destroy note (destroy)
router.post("/destroy/confirm", ensureAuthenticated, async (req, res, next) => {
  try {
    await notes.destroy(req.body.notekey);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});
