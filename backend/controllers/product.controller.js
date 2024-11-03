import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find({});
		res.json({ products });
	} catch (error) {
		console.log("error in getallProducts controller");
		res.status(500).json({ message: "server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "no featured products found" });
		}

		await redis.set("featured_products", JSON.stringify(featuredProducts));

		res.json(featuredProducts);
	} catch (error) {
		console.log("error in getFeaturedProducts controller");
		res.status(500).json({ message: "server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, catagory } = req.body;

		let cloudinaryResponse = null;

		if (image) {
			cloudinaryResponse = await cloudinary.uploader.upload(image, {
				folder: "products",
			});
		}
		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url
				? cloudinaryResponse.secure_url
				: "",
			catagory,
		});

		res.status(201).json({ product });
	} catch (error) {
		console.log("error in createProduct controller");
		res.status(500).json({ message: "server error", error: error.message });
	}
};
