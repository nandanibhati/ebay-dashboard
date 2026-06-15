const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/ebay_dashboard")
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