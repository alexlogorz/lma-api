// utils.js
import axios from 'axios';
import dotenv from "dotenv";
import Airtable from 'airtable';

dotenv.config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_ACCESS_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

async function hasPurchased(customerId, productId) {
  const accessToken = process.env.APP_CLIENT_ID;  // Api key from appv
  const shopDomain = process.env.SHOPIFY_STORE;  // Store domain (e.g., mystore.myshopify.com)
  
  const url = `https://${shopDomain}/admin/api/2023-01/orders.json`;

  try {
    // Fetch orders for the given customer ID
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,  // Use access token for authorization
      },
      params: {
        customer_id: customerId,  // Filter orders by customer
        financial_status: 'paid',  // Only consider paid orders
      },
    });

    // Loop through the orders to check for the product
    for (const order of response.data.orders) {
      for (const lineItem of order.line_items) {
        if (lineItem.product_id === parseInt(productId, 10)) {
          return true;  // Product found in order
        }
      }
    }

    return false;  // Product not found in any order
  } 
  catch (error) {
    throw error;  // Rethrow the error for handling in the calling function
  }
}

async function getCourseById(programId) {
    try {
        const records = await base('Programs').select({
            view: 'All Programs'
        }).all();

        const filteredRecords = records.filter(record => record.fields['Program ID'] === programId);

        if (filteredRecords.length > 0) {
            const course = filteredRecords[0].fields;

            // Fetch lessons data
            if (course.Lessons && course.Lessons.length > 0) {
                const lessonPromises = course.Lessons.map(lessonId => base('Lessons').find(lessonId));
                const lessons = await Promise.all(lessonPromises);
                
                course.Lessons = lessons.map(lesson => lesson.fields);
            }

            return course;
        } 
        else {
            throw new Error('Program not found');
        }
    } 
    catch (error) {
        throw error;  // Rethrow the error for handling in the calling function
    }
}

// Get student details by id
async function getStudentById(studentId) {
    try {
        const records = await base('Students').select({
            view: 'Student Details'
        }).all();

        const filteredRecords = records.filter(record => record.fields['Student ID'] === studentId);

        if(filteredRecords.length > 0) {
            const student = filteredRecords[0].fields;

            // Fetch lessons data
            if (student.Lessons && student.Lessons.length > 0) {
              const lessonPromises = student.Lessons.map(lessonId => base('Lessons').find(lessonId));
              const lessons = await Promise.all(lessonPromises);

              student.Lessons = lessons.map(lesson => lesson.fields);
            }

            return student;
        }
        else {
            throw new Error('Student not found');
        }
    }
    catch (error) {
        throw error;  // Rethrow the error for handling in the calling function
    }
}

export { hasPurchased, getCourseById, getStudentById };
