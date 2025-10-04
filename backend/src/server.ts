import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.json({ message: 'Access Manager backend is running' });
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
