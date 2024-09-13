const Categories = require("../models/Categories")

exports.createCategories = async (req, res) => {
    try {
        // fetch data from body
        const {name, description} = req.body;
        // validation
        if (!name || !description) {
            return res.status(400).json({
                success: true,
                message: "All fields are required"
            })
        }
        // create entry in db
        const categoriesDetails = await Categories.create({
            name: name,
            description: description,
        });
        console.log(categoriesDetails);
        // return response
        return res.status(200).json({
            success: true,
            message: "Categories created successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: console.log("failed to create Categories", error.message),
        })
    }
}

exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Categories.find({},{name: true, description: true});
        return res.status(200).json({
            success: true,
            message: "All Categories fetched successfully",
            allCategories,
        });

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: console.log("unable to fetch all Categories", error.message),
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        // get categoryId
        const {categoryId} = req.body;
        // get courses for specified categoryId
        const selectedCategory = await Categories.findById({categoryId}).populate("course").exec();
        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Specified Course not found"
            })
        }
        // get courses for different categories
        const differentCategories = await Categories.findById({
            _id: {$ne: categoryId},
        }).populate("course").exec();
        // get top selling courses :HW
        // return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to get category page details",
            error: error.message,
        })
    }
}