import { default as express } from "express";
import { NotesStore as notes } from "../models/notes-store.mjs";
export const router = express.Router();
/* GET home page. */

router.get("/", async (req, res, next) => {
  try {
    let keylist = await notes.keylist();
    let keyPromises = keylist.map((key) => {
      return notes.read(key);
    });
    let notelist = await Promise.all(keyPromises);
    res.render("index", {
      title: "Notes",
      notelist: notelist,
      user: req.user ? req.user : undefined,
    });
  } catch (e) {
    next(e);
  }
});
