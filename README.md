# LMA API - Latin Mix Academy

LMA API is a backend service for the Latin Mix Academy (LMA) Shopify store, built with Node.js and Express. The API integrates with Airtable and Shopify to manage store data and streamline various operations.

## Features
- **Airtable API Integration**: Retrieve and manage data from Airtable to keep LMA's operations seamless.
- **Shopify API Integration**: Interact with the Shopify store to manage products, orders, and customer data.
- **Purchase Check Endpoint**: Allows checking if a customer has purchased a specific product.
- **Course Fetch Endpoint**: Retrieve course details based on a unique course ID.

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/lma-api.git
    cd lma-api
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Setup environment variables:**
   - Create a `.env` file in the root directory and add the following variables:

    ```
    AIRTABLE_ACCESS_TOKEN=your_airtable_api_key
    SHOPIFY_ACCESS_TOKEN=your_shopify_api_key
    SHOPIFY_STORE=your_shopify_store_name
    ```

4. **Run the server:**

    ```bash
    npm start
    ```

    The API will be running on `http://localhost:3000`.

## API Endpoints

### `/check-purchase`
- **Method**: `POST`
- **Description**: Checks if a customer has purchased a specific product.
- **Request Body**:
    ```json
    {
      "customerId": "customer-id",
      "productId": "product-id"
    }
    ```
- **Response**:
    ```json
    {
      "hasPurchased": true
    }
    ```

### `/course/:id`
- **Method**: `GET`
- **Description**: Fetches a specific course by its ID.
- **URL Parameters**: 
  - `id` (course ID)
- **Response**:
    ```json
    "Name": "Latin DJ Essentials",
    "Scheduling": [],
    "Students": [],
    "Program ID": "1",
    "Lessons": []
    ```

## Technologies Used
- **Node.js**: JavaScript runtime used for the server-side logic.
- **Express**: Framework to build the API.
- **Airtable API**: Integration to manage data in Airtable.
- **Shopify API**: Integration to manage the Shopify store.
- **CORS**: Cross-Origin Resource Sharing setup for handling requests from Shopify store and local environments.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a new Pull Request.
