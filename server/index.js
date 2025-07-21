import express from "express";
import userRoutes from './router/users.js'
const server = express();

server.use(express.json());
server.use('/users',userRoutes)
server.listen(3000, () => {
  console.log("serverlistening...");
});
