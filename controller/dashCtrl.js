const Admin = require('../models/userModel')
const Order = require('../models/orderModel')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit');

const salesReport = async(req,res)=>{
    try {
        const admin = req.session
        const orderDta = await Order.find()
        .sort({orderDate:-1})
        .populate({
            path : 'orderItems.product',
            model : 'Product',
            populate : {
                path : 'category',
                model : 'Category'
            }
        })
        .populate('user_id')

        res.render('sales-report',{
            adminName : admin.adminName,
            adminEmail : admin.adminEmail,
            order : orderDta
        })
    } catch (error) {
        console.log(error.message);
    }
}


const filter = async (req, res) => {
    try {
        const { startDate, endDate, statusFilter } = req.body;
        console.log(req.body);

        const query = {};

        if (statusFilter !== "") {
            query.status = statusFilter;
        }

        if (startDate && endDate) {
            query.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const orders = await Order.find(query)
            .populate({
                path: 'orderItems.product',
                model: 'Product',
                populate: {
                    path: 'category',
                    model: 'Category',
                },
            })
            .populate('user_id')
            .sort({orderDate:-1})
            .exec();

        res.json({ result: orders });
    } catch (error) {
        console.error("Error in getOrdersByDate:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// const exportPDF = async (req, res) => {
//     try {
//         const orderData = await Order.find()
//             .populate({
//                 path: 'orderItems.product',
//                 model: 'Product',
//                 populate: {
//                     path: 'category',
//                     model: 'Category'
//                 }
//             })
//             .populate('user_id');

//         const pdf = new PDFDocument();
//         const filePath = path.resolve(__dirname,'../views/admin/html-pdf.ejs')
//         const stream = fs.createWriteStream(filePath);

//         pdf.pipe(stream);

//         // Add content to the PDF
//         pdf.fontSize(16).text('Sales Report', { align: 'center' }).moveDown();

//         for (const order of orderData) {
//             for (const orderItem of order.orderItems) {
//                 pdf.text(`Order ID: ${order._id}`);
//                 pdf.text(`Customer: ${order.user_id.name}`);
//                 pdf.text(`Category: ${orderItem.product.category.name}`);
//                 pdf.text(`Item Name: ${orderItem.name}`);
//                 pdf.text(`Price: ${order.totalAmount}`);
//                 pdf.text(`Payment: ${order.paymentMethod}`);
//                 pdf.moveDown();
//             }
//         }

//         pdf.end();

//         stream.on('finish', () => {
//             res.download(filePath, 'sales-report.pdf', (err) => {
//                 if (err) {
//                     console.error(err);
//                     res.status(500).send('Internal Server Error');
//                 }
//             });
//         });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };

// const exportPDF = async (req, res) => {
//     try {
//         const orderData = await Order.find()
//             .populate({
//                 path: 'orderItems.product',
//                 model: 'Product',
//                 populate: {
//                     path: 'category',
//                     model: 'Category'
//                 }
//             })
//             .populate('user_id');

//         const pdf = new PDFDocument(); // Create a new PDF document
//         const filePath = path.resolve(__dirname, '../views/admin/html-pdf.ejs');
//         const stream = fs.createWriteStream(filePath);

//         pdf.pipe(stream);

//         // Add content to the PDF
//         pdf.fontSize(16).text('Sales Report', { align: 'center' }).moveDown();

//         const headers = ['Order ID', 'Customer', 'Category', 'Item Name', 'Price', 'Payment'];

//         // Set font for the table
//         pdf.font('Helvetica-Bold');

//         // Draw headers
//         let currentY = pdf.y + 10;
//         headers.forEach((header, index) => {
//             pdf.text(header, 50 + index * 120, currentY);
//         });

//         // Draw dividing lines for headers
//         pdf.moveTo(50, currentY + 10).lineTo(770, currentY + 10).stroke();

//         // Draw rows
//         currentY += 20;
//         for (const order of orderData) {
//             for (const orderItem of order.orderItems) {
//                 pdf.text(order._id.toString(), 50, currentY);
//                 pdf.text(order.user_id.name, 170, currentY);
//                 pdf.text(orderItem.product.category.name, 290, currentY);
//                 pdf.text(orderItem.name, 410, currentY);
//                 pdf.text(order.totalAmount.toString(), 530, currentY);
//                 pdf.text(order.paymentMethod, 650, currentY);
//                 currentY += 15;

//                 // Draw dividing line for rows
//                 pdf.moveTo(50, currentY).lineTo(770, currentY).stroke();
//             }
//         }

//         pdf.end();

//         stream.on('finish', () => {
//             res.download(filePath, 'sales-report.pdf', (err) => {
//                 if (err) {
//                     console.error(err);
//                     res.status(500).send('Internal Server Error');
//                 }
//             });
//         });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

module.exports = {
    salesReport,
    filter
    
}
