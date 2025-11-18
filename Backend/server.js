import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Server Is Ready!');
    }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serve at http://localhost:${PORT}`);
    }
);