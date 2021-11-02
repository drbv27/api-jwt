const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// capturar body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.mzxff.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Base de datos conectada"))
  .catch((e) => console.log("error db:", e));

// import routes
const authRoutes = require("./routes/auth");
const validaToken = require("./routes/validate-token");
const dashboard = require("./routes/dashboard");

// route middlewares
app.use("/api/user", authRoutes);
app.use("/api/dashboard", validaToken, dashboard);
app.get("/", (req, res) => {
  res.json({
    estado: true,
    mensaje: "funciona!",
  });
});

// iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`servidor andando en: ${PORT}`);
});
