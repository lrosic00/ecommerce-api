const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		console.log("db connection succesful");
	})
	.catch((e) => {
		console.log(e);
	});

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);

const path = require("path");

app.use(express.static(path.join(__dirname, "/client/build")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});
app.listen(process.env.PORT || 5000, () => {
	console.log("Backend server is running on port: " + process.env.PORT);
});
