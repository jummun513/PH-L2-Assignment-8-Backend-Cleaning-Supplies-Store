# PH-L2-Frontend-Track-M29-A8-Cleaning-supplies-store-Backend: [Live Link](https://ph-l2-assignment-8-backend-cleaning.onrender.com)

## Project Installation In Local Server:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Rename `.env.example` to `.env`.
4. Run the server using `npm run dev`.

## Configuration:

- Environment Variables:
  - `PORT`: Port number the server listens on. Default: 3000
  - `MONGODB_URI`: URI for MongoDB database.
  - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
  - `CLOUDINARY_API_KEY`: Cloudinary api key.
  - `CLOUDINARY_API_SECRET`: Cloudinary api secret.

<!--
## Usage:

- API Endpoints:

  - POST `/api/v1/create-product`

    - Description: Create a new product.
    - Request:
      ```form-data
      {
        "data": {
          "title": "Power soap",
          "desc": "A short description.",
          "price": 9.21,
          "rating": 4.0,
          "category": "Dish Washing Soap",
          "isTrending": false,
          "isFlashSale": false,
          "isCarousel": true
        },
        "file": {}
      }
      ```
    - Response:
      ```json
      {
        "success": true,
        "message": "Product created successfully",
        "data": {
          "acknowledged": true,
          "insertedId": "664e5f99f7607560bce"
        }
      }
      ```
 -->

## Dependencies:

- `cors`: Express middleware for enabling CORS with frontend.
- `dotenv`: Loads environment variables from .env file.
- `express`: Web framework for Node.js.
- `mongodb`: MongoDB driver for Node.js.
- `nodemon`: Utility for automatically restarting the server during development.

<!--
### Before Pushing Code:

1. Before pushing your code to the remote repository, ensure that you have run the following command in your terminal (Git Bash):
   ```bash
   rm -rf .git
   ```
-->
