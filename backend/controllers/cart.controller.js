export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;

		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.id === productId);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push(productId);
		}

		await user.save();

		res.json(user.cartItems);
	} catch (error) {
		console.log("error in addToCart controller");
		res.status(500).json({ message: error.message });
	}
};
export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;

		const user = req.user;

		if (!productId) {
			user.cartItems = [];
		} else {
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}

		await user.save();

		res.json(user.cartItems);
	} catch (error) {
		console.log("error in removeAllFromCart controller");
		res.status(500).json({ message: error.message });
	}
};
