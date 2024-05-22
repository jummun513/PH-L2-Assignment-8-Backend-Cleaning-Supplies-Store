const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const { z } = require('zod');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.cwd() + '/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    },
});
const upload = multer({ storage: storage });

// file save into cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const sendImageToCloudinary = (
    imageName,
    path,
    folderName,
) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            path,
            { public_id: imageName, folder: folderName },
            function (error, result) {
                if (error) {
                    reject(error);
                }
                resolve(result);
                fs.unlink(path, error => {
                    if (error) {
                        reject(error);
                    }
                });
            },
        );
    });
};

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('PH_L2_A8');
        const productCollection = db.collection('products');


        // for zod validation function and schema
        const validateRequest = (schema) => {
            return async (req, res, next) => {
                try {
                    await schema.parseAsync(req.body);
                    next();
                } catch (error) {
                    next(error);
                }
            };
        };
        const productCreateValidationSchema = z.object({
            title: z
                .string({
                    required_error: 'Title field is required!',
                    invalid_type_error: 'Title field allowed only string!',
                })
                .min(3, 'Title length too short. Minimum 3 characters.'),
            desc: z
                .string({
                    invalid_type_error: 'Title field allowed only string!',
                }),
            category: z
                .string({
                    required_error: 'Category field is required!',
                    invalid_type_error: 'Category field allowed only string!',
                })
                .min(3, 'Category field is required!'),
            price: z.number({
                required_error: "Price is required",
                invalid_type_error: "Price must be a number",
            }).nonnegative('Only positive number is allowed!'),
            rating: z.number({
                required_error: "Rating is required",
                invalid_type_error: "Rating must be a number",
            }).nonnegative('Only positive number is allowed!'),
            isTrending: z.boolean({
                required_error: "isTrending is required",
                invalid_type_error: "isTrending must be a boolean",
            }),
            isFlashSale: z.boolean({
                required_error: "isFlashSale is required",
                invalid_type_error: "isFlashSale must be a boolean",
            })
        });

        // create new product
        app.post('/api/v1/create-product', upload.single('file'), (req, res, next) => {
            req.body = JSON.parse(req.body.data);
            next();
        }, validateRequest(productCreateValidationSchema), async (req, res) => {
            if (req.file) {
                const photoUrl = await sendImageToCloudinary(
                    req.file?.filename,
                    req.file?.path,
                    'ph_l2_a8/products',
                );
                req.body.image = {
                    url: photoUrl?.secure_url,
                    publicId: photoUrl?.public_id,
                };
            }
            else {
                req.body.image = {
                    url: '',
                    publicId: '',
                };
            }
            const result = await productCollection.insertOne({ ...req.body, isDeleted: false });

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: result,
            });
        });

        // get all products with filtering
        app.get('/api/v1/products', async (req, res) => {
            const query = req.query;
            const filterQueryObj = { ...query };
            const excludeFields = [
                'searchTerm',
                'category',
                'rating'
            ];
            excludeFields.forEach(el => delete filterQueryObj[el]);
            let categoryQueryObj = { ...filterQueryObj };
            if (query?.category) {
                categoryQueryObj = {
                    category: query.category,
                    ...filterQueryObj,
                };
            }

            let ratingQueryObj = { ...categoryQueryObj };
            if (query?.rating) {
                ratingQueryObj = {
                    rating: { $gte: parseFloat(query.rating) },
                    ...categoryQueryObj
                }
            }
            const result = await productCollection.find({ isDeleted: { $ne: true }, ...ratingQueryObj }, { projection: { isDeleted: 0 } }).toArray();
            const total = result?.length;
            res.status(201).json({
                success: true,
                message: 'Products retrieved successfully',
                metaData: { total: total },
                data: result
            });
        });

        // get a product using id
        app.get('/api/v1/product/:id', async (req, res) => {
            const id = req.params.id;
            const result = await productCollection.findOne({ _id: new ObjectId(id), isDeleted: { $ne: true } }, { projection: { isDeleted: 0 } });
            res.status(201).json({
                success: true,
                message: 'Product retrieved successfully',
                data: result
            });
        });



        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
    const serverStatus = {
        message: 'Server is running smoothly',
        timestamp: new Date()
    };
    res.json(serverStatus);
});