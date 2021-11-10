const Order = require("../models/Order");
const {
	verifyToken,
	verifyTokenAndAuthorization,
	verifyTokenAndAdmin,
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router = require("express").Router();

//Create
router.post("/", verifyToken, async (req, res) => {
	const newOrder = new Order(req.body);

	try {
		const savedOrder = await newOrder.save();
		console.log(newOrder);
		res.status(200).json(savedOrder);
	} catch (err) {
		res.status(500).json(err);
	}
});

//update
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
	try {
		const updatedOrder = await Order.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		res.status(200).json(updatedOrder);
	} catch (err) {
		res.status(500).json(err);
	}
});

//delete
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
	try {
		await Order.findByIdAndDelete(req.params.id);
		res.status(200).json("Order has been deleted!");
	} catch (err) {
		res.status(500).json(err);
	}
});

//get user orders
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
	try {
		const orders = await Order.find({ userId: req.params.userId });
		res.status(200).json(orders);
	} catch (err) {
		res.status(500).json(err);
	}
});

//get all products
router.get("/", verifyTokenAndAdmin, async (req, res) => {
	try {
		const orders = await Order.find();
		res.status(200).json(orders);
	} catch (err) {
		res.status(500).json(err);
	}
});

//get monthly income
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
	const productId = req.query.pid;
	const date = new Date();
	const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
	const prevMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

	try {
		const income = await Order.aggregate([
			{
				$match: {
					createdAt: { $gte: prevMonth },
					...(productId && {
						products: {
							$elemMatch: { productId },
						},
					}),
				},
			},
			{
				$project: {
					month: { $month: "$createdAt" },
					sales: "$amount",
				},
			},
			{
				$group: {
					_id: "$month",
					total: { $sum: "$sales" },
				},
			},
		]);
		res.status(200).json(income);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;