const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Address = require('../models/addressModel')
const Cart_item = require('../models/cartModel');
const { image } = require('pdfkit');
const easyinvoice = require('easyinvoice');
const moment = require('moment')
const path = require('path');
const fs = require('fs').promises

const orderHistory = async(req,res)=>{
    try {
        const user = req.session.name;
        const id = req.session.user
        const orders = await Order.find().sort({orderDate:-1})
      
        res.render('order-history', {
          user,
          orderData: orders
        });
      } catch (error) {
        console.error('Error:', error);
      }      
}

const cancelOrder = async (req, res) => {
    try {
        const { order_id, paymentMethod, status } = req.body;

        if ((paymentMethod === 'Wallet' || paymentMethod === 'RazorPay' && status !== 'Pending') ) {
            res.redirect(`/cancel-refund?id=${order_id}`);
        } else {
            const cancel = await Order.findOneAndUpdate(
                { _id: order_id },
                { $set: { status: 'Cancelled' } },
                { new: true }
            );

            res.json({ success: true });
        }
    } catch (error) {
        console.error('Error in order cancellation:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const orderDetails = async(req,res)=>{
    try {
        const user = req.session.name
        const { id } = req.query

        const ordered_product = await Order.findById(id)
        .populate("shippingAddress")
        .populate({
            path : 'orderItems.product',
            model : 'Product',
            populate : {
                path : 'category',
                model : 'Category'
            }
        })

        const imageUrl = [];
        for (const item of ordered_product.orderItems) {
             if (item.product && item.product.image) {
                const images = item.product.image.map(image => {
                     return `/product-images/${image.filename}`;
                });
                imageUrl.push(images);
            }
        }

        res.render('order_details',{
            user,
            order: ordered_product,
            imageUrls: imageUrl
        })

    } catch (error) {
        console.log(error.message)
    }
}

const returnOrder = async(req,res)=>{
    try {
        const { order_id, paymentMethod, status } = req.body;

            const cancel = await Order.findOneAndUpdate(
                { _id: order_id },
                { $set: { status: 'Returned' } },
                { new: true }
            );

            res.json({ success: true });
 
        } catch (error) {
        console.log(error.message);
    }
}

// const invoic = async(req,res)=>{
//     try {
//         const { order_id } = req.params
//         console.log('req.params',order_id);

//         const order = await Order.findById({_id: order_id});
//         if (!order) {
//             return res.status(404).send({ message: 'Order not found' });
//         }
//         const { user_id, shippingAddress } = order;

//         const [user, address] = await Promise.all([
//             User.findById(user_id),
//             Address.findById(shippingAddress),
//         ]);

//         const products = order.orderItems.map((product) => ({
//             quantity: product.quantity.toString(),
//             description: product.name,
//             tax: product.tax,
//             price: product.pricePerOrdrItem,
//         }));

//         console.log("---",products);
//         const date = moment(order.date).format('DD-MM-YYYY');


//         if (!user || !address) {
//             return res.status(404).send({ message: 'User or address not found' });
//         }

//         const filename = `invoice_${order_id}.pdf`;

//        // const customTemplate = await readTemplateFromFile();

//         const data = {

//             "customize": {
//                 //template: Buffer.from(customTemplate).toString('base64')
//             },

//             "images": {
            //     "logo": "https://public.budgetinvoice.com/img/logo_en_original.png",
            //     "background": "https://public.budgetinvoice.com/img/watermark-draft.jpg"
            // },

//             "sender": {
                // "company": "SuperShop Corp",
                // "address": "Kollam Street 123",
                // "zip": "609091 AB",
                // "city": "Kochi",
                // "country": "India"
//             },

//             "client": {
//                 "company": user.name,
//                 "address": address.house,
//                 "zip": address.pin,
//                 "city": address.city,
//                 "country": address.state
//             },

//             "information": {
//                 "number": "0091.0061",
//                 date: date,
//                 "due-date": "31-12-2024"
//             },

//             products:  products ,

//             "bottom-notice": "Thanks for shopping with us.",

//             "settings": {
//                 "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
//             },
//         };

       
//         easyinvoice.createInvoice(data, function (result) {
//             const fileName = 'invoice.pdf'
//             const pdfBuffer = Buffer.from(result.pdf, 'base64');
//             res.setHeader('Content-Type', 'application/pdf');
//             res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
//             res.send(pdfBuffer);
//         })
//         console.log('PDF base64 string: ');

//     } catch (error) {
//         console.log(error);
//         res.status(500).send({ message: 'Internal Server Error' });

//     }
// }

const readTemplateFromFile = async () => {
    const templatePath = path.join(__dirname, '../public/invoice.html');
    return await fs.readFile(templatePath, 'utf-8');
};

const invoice = async (req, res) => {
    try {
        const orderId = req.params.order_id;
        //console.log('invoice order id', orderId)
        const user_id = req.session.user; // Use req.session.user_id

        const order = await Order.findOne({ _id: orderId }).populate('orderItems.product');

        if (!order) {
            return res.status(404).send('Order not found');
        }
        const { shippingAddress } = order;
        const [ address] = await Promise.all([
           // User.findById(user_id),
            Address.findById(shippingAddress),
        ]);

        const customTemplate = await readTemplateFromFile();
        const data = {
            customize: {
                template: Buffer.from(customTemplate).toString('base64')
            },
            images: {
                logo: "https://public.budgetinvoice.com/img/logo_en_original.png",
                background: "https://public.budgetinvoice.com/img/watermark-draft.jpg"
            },
            sender: {
                company: "SuperShop",
                address: "Kollam SP Nagar 11",
                city: "Kochi",
                country: "India",
            },
            client: {
                company: "Customer Address",
                //"zip": `${address.pin}`,
                "city": `${address.city} `,
                "address": `${address.house},${address.city},${address.pin}`
            },
            information: {
                number: order.orderID,
                date: order.orderDate.toISOString().split('T')[0],
            },
            products: order.orderItems.map(item => ({
                description: item.product.name,
                quantity: item.quantity,
                price: item.pricePerOrdrItem,
            })),
            total: order.totalAmount.toFixed(2),
            // Omitting tax property to exclude VAT
            tax: [],
            "bottom-notice": "Thanks for shopping with Kid zone.",
        };

        // Generate the invoice PDF
        const result = await easyinvoice.createInvoice(data);

        // Decode the base64 string to binary data
        const binaryData = Buffer.from(result.pdf, 'base64');

        const fileName = `invoice_${orderId}.pdf`;
        const filePath = path.join(__dirname, '../public/invoices', fileName);

        // Save the PDF file using fs.promises.writeFile
        await fs.writeFile(filePath, binaryData);

        // Set the response headers to indicate a downloadable file
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/pdf');

        res.status(200).end(binaryData);

    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    orderHistory,
    cancelOrder,
    orderDetails,
    returnOrder,
    invoice
}                 