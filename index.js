const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./model/users");
const Task = require("./model/task");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
dotenv.config();
app.use(express.json());
const jwtSecretKey = process.env.JWT_SECRET_KEY;
app.use(cors({
 // origin: "http://localhost:3000"
    origin : "https://capstone-front-end-nu.vercel.app"
}));

// app.use((req,res,next)=>{
//   res.setHeader('Content-Security-Policy',"connect-src 'self' https://capstone-backend-5rvl.onrender.com");
//   next();
// })

// app.use(function(req, res, next) { 
//   res.header("Access-Control-Allow-Origin", "https://capstone-front-end-nu.vercel.app");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });



function verifyToken(req, res, next) {
	try {
	  const token = req.headers.authorization.split("Bearer ")[1];
	  const decoded = jwt.verify(token, jwtSecretKey);
  
	  if (Date.now() >= decoded.exp * 1000) {
		return res.status(401).json({ error: "Token has expired" });
	  }
  
	  next();
	} catch (error) {
	  return res.status(401).json({ error: "Invalid or expired token" });
	}
  }

  app.get("/", async (req, res, next) => {
    res.send("Welcome to capstone backend");
  });

// Handling post request
app.post("/login", async (req, res, next) => {
	try {
    console.log("Entering /login endpoint");
	  const { email, password } = req.body;
	  const existingUser = await User.findOne({ email });
  
	  if (!existingUser || !bcrypt.compareSync(password, existingUser.password)) {
		return res.status(401).json({ error: "Invalid credentials" });
	  }
  
	  const token = jwt.sign(
		{ userId: existingUser.id, email: existingUser.email },
		jwtSecretKey,
		{ expiresIn: "1h" }
	  );
  
	  res.status(200).json({
		success: true,
		data: {
		  userId: existingUser.id,
		  email: existingUser.email,
		  token: token,
		},
	  });
    console.log("Exiting /login endpoint");
	} catch (error) {
	  console.error("Error in /login endpoint:", error);
      res.status(500).json({ error: "Internal server error during login" });
	}
  });
  
  
  // Handling post request
app.post("/signup", async (req, res, next) => {
	try {
	  const { name, email, password } = req.body;
	  const existUser = await User.findOne({ email });
  
	  if (existUser) {
		return res.status(400).json({
		  errorCode: "USER_EXISTS",
		  message: "User already exists",
		  status: false
		});
	  }
  
	  const newUser = await new User({
		name,
		email,
		password
	  });
	  await newUser.save();
  
	  const token = jwt.sign(
		{ userId: newUser.id, email: newUser.email },
		jwtSecretKey,
		{ expiresIn: "1h" }
	  );
  console.log("Generated token :",token)
	  res.status(201).json({
		success: true,
		data: { userId: newUser.id, email: newUser.email, token: token },
	  });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: "Internal server error" });
	}
  });
  

app.post("/add/task", async (req, res, next) => {
  console.log("req.body:: /add/task");
  console.log(req.body);
  const { email, desc, from, to } = req.body;
  let existingUser;
  let newTask;
  try {
    existingUser = await User.findOne({ email: email });
    console.log("existingUser::")
    console.log(existingUser)
  } catch {
    const error = "Error! Something went wrong.";
    res.send({
      status: 500,
      message: error
    })
  }

  if (!existingUser) {
    const error = "Registered users only allow adding tasks!";
    res.send({
      status: 500,
      message: error,
      errorCode: "USER_NOT_EXISTS"
    })
  } else {
    newTask = await Task({
      email,
      desc,
      from,
      to
    });
  }

  try {
    await newTask.save();
    res
      .status(201)
      .json({
        success: true,
        data: { userId: newTask.id },
      });
  } catch {
    res.send({
      status: 500,
      message: "Error! Something went wrong."
    })
  }
});

app.get("/get/task", verifyToken, async (req, res, next) => {
  console.log("Inside Get Task::");
  Task.find({}, function (err, data) {
    res
      .status(200)
      .json({
        success: true,
        data: data,
      });
  })
});

app.get("/users/get", verifyToken, async (req, res, next) => {
  console.log("Inside Users::");
  User.find({}, function (err, data) {
    res
      .status(201)
      .json({
        success: true,
        data: { records: data },
      });
  })
});

app.get("/home", async (req, res, next) => {
  res.send("Welcome to hallss");
});

mongoose.set('strictQuery',true)
//Connecting to the database
mongoose
  .connect("mongodb+srv://murran171:Muralitharan171@cluster0.t7ewgl7.mongodb.net/cpt", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT || 4500, () => {
      console.log(`Server is listening on port ${process.env.PORT || 4500}`);
    });
  })
  .catch((err) => {
    console.log("Error Occurred", err);
  });