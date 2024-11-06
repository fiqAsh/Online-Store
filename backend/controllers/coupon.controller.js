import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
	try {
		const coupon = await Coupon.find({ userId: req.user._id, isActive: true });

		res.json(coupon || null);
	} catch (error) {
		console.log("error in getCoupons controller");
		res.status(500).json({ message: error.message });
	}
};

export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;

		const coupon = await Coupon.findOne({
			code: code,
			userId: req.user._id,
			isActive: true,
		});

		if (!coupon) {
			return res.status(404).json({ message: "coupon not found" });
		}

		if (coupon.expirationDate < new Date()) {
			coupon.isActive = false;

			await coupon.save();

			return res.status(404).json({ message: "coupon expired" });
		}

		res.json({
			message: "coupon valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("error in validateCoupon controller");
		res.status(500).json({ message: error.message });
	}
};
