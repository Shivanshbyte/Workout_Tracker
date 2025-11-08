const express = require('express');
const cors = require('cors');
const bodyParser = require('express').json;
const workoutsRouter = require('./routes/workouts');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser());
app.use('/api/workouts', workoutsRouter);

app.get('/', (req, res) => res.json({ message: 'BillionaireFit API running' }));

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
