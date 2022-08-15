const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const bp = require('body-parser')
const PORT = process.env.PORT || 3000;

let selectedURI = '';

let list = []

// load the list of uris from the file
fs.readFile('app/list.json', 'utf8', (err, data) => {
  if (err) throw err;
  list = JSON.parse(data);
});

app.get('/', (req, res) => {
  if (selectedURI === '') {
    selectedURI = list[0];
  } else if (selectedURI === 'random') {
    let ur = list[Math.floor(Math.random() * list.length)];
    console.log(ur);
    res.redirect(ur.uri);
    return;
  }
  console.log(selectedURI);
  res.redirect(selectedURI.uri);
});

app.post('/new', bp.json(), (req, res) => {
  let obj = {
    id: list.length,
    name: req.body.name,
    uri: req.body.uri
  };
  list.push(obj);
  fs.writeFile('app/list.json', JSON.stringify(list), (err) => {
    if (err) throw err;
  });
  res.send("Received!")
});

app.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  list = list.filter(obj => obj.id !== parseInt(id));
  fs.writeFile('app/list.json', JSON.stringify(list), (err) => {
    if (err) throw err;
  });
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
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

app.get('/app/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/style.css'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})