import express from "express";
import userRoutes from './router/users.js'
import 'dotenv/config'
const server = express();

server.use(express.json());
server.use('/users',userRoutes)
server.listen(process.env.EXSPRESS_PORT, () => {
  console.log("serverlistening...");
});
