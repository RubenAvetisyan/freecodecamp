const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = { username, _id: Date.now().toString() };
  users.push(newUser);
  res.json(newUser);
});

// Get a list of all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercises for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
  const newExercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate,
    _id: userId
  };

  exercises.push(newExercise);

  res.json({
    ...user,
    ...newExercise
  });
});

// Get a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  let userExercises = exercises.filter(e => e._id === userId);

  if (from) {
    const fromDate = new Date(from).getTime();
    userExercises = userExercises.filter(e => new Date(e.date).getTime() >= fromDate);
  }

  if (to) {
    const toDate = new Date(to).getTime();
    userExercises = userExercises.filter(e => new Date(e.date).getTime() <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: userId,
    log: userExercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
