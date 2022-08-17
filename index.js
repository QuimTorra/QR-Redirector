import express from 'express';
import path from 'path';
import fs from 'fs';
import bp from 'body-parser'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBC1Nhbfc8AnghBrHKsrhznQG83qM-T8wg",
  authDomain: "qr-redirector-92dd3.firebaseapp.com",
  databaseURL: "https://qr-redirector-92dd3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "qr-redirector-92dd3",
  storageBucket: "qr-redirector-92dd3.appspot.com",
  messagingSenderId: "341546320145",
  appId: "1:341546320145:web:5e1e56f42cca1234dd4cb0"
};

const fapp = initializeApp(firebaseConfig);
const db = getDatabase(fapp);
const dbRef = ref(db);
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

let selectedURI = '';
let list = []

get(child(dbRef, '/list')).then((snapshot) => {
  if (snapshot.exists()) {
    list = snapshot.val();
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});

app.get('/', (req, res) => {
  if (selectedURI === '' || selectedURI === 'random') {
    let ur = list[Math.floor(Math.random() * list.length)];
    res.redirect(ur.uri);
    return;
  }
  res.redirect(selectedURI.uri);
});

app.post('/new', bp.json(), (req, res) => {
  let obj = {
    id: list.length,
    name: req.body.name,
    uri: req.body.uri
  };
  list.push(obj);
  // TODO: Save to db
  writeData(obj.id, obj.name, obj.uri);
  res.send("Received!")
});

// TODO: delete from db
app.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  list = list.filter(obj => obj.id !== parseInt(id));
  set(ref(db, 'list/'+id), null)
  res.send("Deleted!");
});

app.post('/select', bp.json(), (req, res) => {
  let id = req.body.id;
  if (id === 'rand') {
    selectedURI = "random";
    res.send("Random selected!");
    return;
  }
  selectedURI = list.find(obj => obj.id === parseInt(id));
  res.send("Selected!");
})

app.get('/list', (req, res) => {
  res.send(list);
});

app.get('/app', (req, res) => {
  res.sendFile('app/index.html', { root: __dirname });
});

app.get('/app/style.css', (req, res) => {
  res.sendFile('app/style.css', {root: __dirname});
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile('app/favicon.ico', {root: __dirname});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

function writeData(id, name, uri) {
  const db = getDatabase();
  set(ref(db, 'list/' + id), {
    id: id,
    name: name,
    uri: uri
  });
}