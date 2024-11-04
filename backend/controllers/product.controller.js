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

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0]; //this will get the id of the image

			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("image deleted");
			} catch (error) {
				console.log("errir deleting image", image);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "product deleted successfully" });
	} catch (error) {
		console.log("error in deleteProduct controller");
		res.status(500).json({ message: "server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: {
					size: 3,
				},
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);
		res.json(products);
	} catch (error) {
		console.log("error in getRecommendedProducts controller");
		res.status(500).json({ message: "server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });

		res.json({ products });
	} catch (error) {
		console.log("error in getProductsByCategory controller");
		res.status(500).json({ message: "server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (product) {
			product.isFeatured = !product.isFeatured;

			const updatedProduct = await product.save();

			await updateFeaturedProductsCache();

			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "product not found" });
		}
	} catch (error) {
		console.log("error in toggleFeaturedProduct controller");
		res.status(500).json({ message: "server error", error: error.message });
	}
};

async function updateFeaturedProductsCache() {
	try {
		const featuredProducts = await Product.find({ isFeatured: true }).lean(); //lean method is used to convert mongoose object to json object which improves performance

		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		console.log("error in updateFeaturedProductsCache function");
	}
}
