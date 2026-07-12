require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

  const user = await User.findOneAndUpdate(
    { email: "penkraft.ltd@gmail.com" },
    { role: "admin" },
    { new: true }
  );

  console.log("Updated User:", user);

  process.exit();
})
.catch(err => console.log(err));