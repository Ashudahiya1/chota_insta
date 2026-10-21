require("dotenv").config();
const express = require("express");
const prisma = require("./db");
const usersRouter = require("./routes/users.routes");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/users", usersRouter);

const PORT = process.env.PORT || 3000;
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

module.exports = { app, prisma, server };
