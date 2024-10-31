import User from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "user already exists" });
		}

		const user = await User.create({ name, email, password });

		res.status(201).json({ user, message: "user created successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
export const login = async (req, res) => {
	res.send("login");
};
export const logout = async (req, res) => {
	res.send("logout");
};
