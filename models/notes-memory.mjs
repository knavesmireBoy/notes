import { Note, AbstractNotesStore } from "./Notes.mjs";
const notes = [];
 class InMemoryNotesStore extends AbstractNotesStore {
  async close() {}
  async update(key, title, body) {
    notes[key] = new Note(key, title, body);
    return notes[key];
  }
  async create(key, title, body) {
    notes[key] = new Note(key, title, body);
    return notes[key];
  }
  async read(key) {
    if (notes[key]) return notes[key];
    else throw new Error(`Note ${key} does not exist`);
  }
  async destroy(key) {
    let k = key.trim();
    console.log('god', notes, key, key.trim());
    if (notes[k]) {
      delete notes[k];
    } else throw new Error(`Note ${k} does not exist`);
  }
  async keylist() {
    return Object.keys(notes);
  }
  async count() {
    return notes.length;
  }
}
export {InMemoryNotesStore};