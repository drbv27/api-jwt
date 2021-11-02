const router = require("express").Router();
const User = require("../models/User");
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const schemaRegister = Joi.object({
  name: Joi.string().min(6).max(255).required(),
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

router.post("/login", async (req, res) => {
  // validaciones
  const { error } = schemaLogin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "contraseña no válida" });

  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    process.env.TOKEN_SECRET
  );
  res.header("auth-token", token).json({
    error: null,
    data: { token },
  });
});

router.post("/register", async (req, res) => {
  //validaciones de usuario
  const { error } = schemaRegister.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const existeEmail = await User.findOne({ email: req.body.email });
  if (existeEmail) {
    return res.status(400).json({
      error: true,
      mensaje: "email ya registrado",
    });
  }

  //hash de contraseña
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: password,
  });

  try {
    const userDB = await user.save();
    res.json({
      error: null,
      data: userDB,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
