import express, { json, urlencoded } from "express";
import cors from 'cors';
import { scheduleJob } from "node-schedule";


//Routes
import authRoutes from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import homeRouter from "./routes/homeRoutes";
import { disableDueJobs } from "./jobs/job";


const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(require("morgan")("dev"));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);
app.use('/api/home', homeRouter);

app.get('/', (req, res) => {
  res.send('Server running ok');
});

// scheduleJob('*/2 * * * *', () => { disableDueJobs(); });

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

