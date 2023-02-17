//Order routes
const RestOrder = require('../Models/RestOrder');
const Dish = require("../Models/Dish");
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Order = RestOrder;
const Restaurant = require("../Models/Restaurant");
const {
    verifyToken,
    authenticateOwner,
    authenticateUser,
    authorizeOwner,
    authorizeUser,
    restOrder,
    authenticate
} = require('../Middlewares/verifyToken');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const jimp = require('jimp');
const fs = require('fs');
const qrCodeReader = require('qrcode-reader');
const qr = require('qrcode');

//GET ALL ORDERS
router.get("/food/order", verifyToken, authenticate, async (req, res) => {
    if (req.isowner) {
        const obj = { restaurant_id: req.restaurant };
        if (req.query.status) {
            obj.Order_status = req.query.status;
        }
        const orders = await Order.find(obj);
        res.status(200).json(orders);
    } else {
        const obj={user_id:req.user};
        if(req.query.status)
        {
            obj.Order_status=req.query.status;
        }
        const orders = await Order.find(obj);
        res.status(200).json(orders);
    }
})
router.get("/food/order/:orderId",verifyToken,authenticate,async(req,res)=>{
    const order=await Order.findById(req.params.orderId);
    if(req.isowner)
    {

        if(req.restaurant==order.restaurant_id)
        {
            res.status(200).json(order);
        }
        else
        {
            res.status(403).json({message:"Not Authenticated"});
        }
    }
    else
    {
        if(req.user==order.user_id)
        {
            res.status(200).json(order);
        }
        else
        {
            res.status(403).json({message:"Not Authenticated"});
        }
    }
})
//CREATE QR FOR USER
router.get("/food/order/qr/:orderId", async (req, res, next) => {
    try {
        const orderid = req.params.orderId;
        let data = { orderid };
        let stringdata = JSON.stringify(data);
        qr.toFile('qr1.png', stringdata, function (err, code) {
            if (err) {
                console.log(err);
            } else {
                console.log('QR code generated!');
            }
        })
        const promise = fs.promises.readFile('./qr1.png');
        Promise.resolve(promise).then(function (buffer) {
            const stringdata = JSON.stringify(buffer);
            res.status(200).json(stringdata);
        })
    }
    catch (err) {
        res.status(400).json(err);
    }
})

//ADDING ORDER
router.post('/food/order/add/:dishId', verifyToken, authenticateUser, async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.dishId);
        const order = await Order.find({ restaurant_id: dish.Rest_Id, user_id: mongoose.Types.ObjectId(req.user), Order_status: 'paymentPending' });
        if (order.length) {
            order[0].items.push(req.params.dishId);
            order[0].total = order[0].total + dish.price;
            await order[0].save();
            return res.status(200).json(order[0]);
        }
        else {
            var today = new Date();
            const newOrder = new Order({ restaurant_id: dish.Rest_Id, user_id: req.user, items: [req.params.dishId], total: dish.price, timeOfOrder: `${today.getFullYear()} ${today.getMonth() + 1} ${today.getDate()}`, Order_status: 'paymentPending' });
            await newOrder.save()
            //payment gateway
            return res.status(200).json(newOrder);
        }

    } catch (err) {
        res.status(500).json(err);
    }
});

//REMOVING THE ITEM
router.post('/food/order/remove/:dishId', verifyToken, authenticateUser, async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.dishId);
        const order = await Order.find({ restaurant_id: dish.Rest_Id, user_id: mongoose.Types.ObjectId(req.user), Order_status: 'paymentPending' });
        if (order.length) {
            const index = order[0].items.indexOf(req.params.dishId);
            if (index > -1) {
                order[0].items.splice(index, 1); // 2nd parameter means remove one item only
                order[0].total = order[0].total - dish.price;
                if(order[0].items.length==0){
                    await Order.findByIdAndDelete(order[0]._id)
                }
            }
            await order[0].save();
            return res.status(200).json(order[0]);
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//ACCEPTING THE ORDER
router.put('/food/rest/accept/:orderid', verifyToken, authenticateOwner, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderid);
        if (req.restaurant == order.restaurant_id) {
            order.Order_status = 'accepted';
            await order.save();
            res.status(200).send("Order Accepted");
        }
        else {
            res.status(403).json({ message: "not authorized" });
        }

    }
    catch (error) {
        return res.status(402).send(error.message)
    }
})

//REJECTING THE ORDER
router.put('/food/rest/reject/:orderid', verifyToken, authenticateOwner, async (req, res) => {
    try {
        
        const order = await Order.findById(req.params.orderid);
        if (req.restaurant == order.restaurant_id) {
            order.Order_status = 'rejected';
            await order.save();
            const razorpayInstance = new Razorpay({
                key_id: req.restaurant.razorpayCred.Key_id || process.env.RZP_KEY_ID,
                key_secret: req.restaurant.razorpayCred.KeySecret || process.env.RZP_SEC_KEY
            })
            razorpayInstance.payments.refund(paymentId,{
                "speed": "optimum",
                
              })
            res.status(200).send("Order Rejected");
            //refund gateway
        }
        else {
            res.status(403).json({ message: "not authorized" });
        }

    }
    catch (error) {

        return res.status(402).send(error.message)
    }
})

//COMPLETING THE ORDER
router.put('/food/rest/complete/:orderid', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderid);
        order.Order_status = 'completed';
        await order.save();
        console.log('here');
        res.status(200).json(order);

    }
    catch (error) {
        return res.status(402).send(error.message)
    }
})

//DELETING AN ORDER
router.delete("/food/order/:orderId", verifyToken, authenticateUser, async (req, res) => {
    
    const order = await Order.findById(req.params.orderId);
    if (order.user_id == req.user) {
        await Order.findByIdAndDelete(req.params.orderId);
        return res.status(200).json({ message: "Order has been deleted!" });
    }
    else {
        res.status(403).send("Not Authorized to delete this order");
    }

})
//payment 
router.put("/food/order/checkout/:orderId", verifyToken, authenticateUser, async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    console.log(order);
    const restaurant = await Restaurant.findById(order.restaurant_id);
    if (order.user_id != req.user) {
        return res.status(403).json({ message: "you are not authenticated" });
    }
    const razorpayInstance = new Razorpay({
        key_id: restaurant.razorpayCred.Key_id || process.env.RZP_KEY_ID,
        key_secret: restaurant.razorpayCred.KeySecret || process.env.RZP_SEC_KEY
    })
    razorpayInstance.orders.create({ amount: order.total * 100, currency: "INR" }, (err, result) => {
        if (err) {
            return res.status(400).send(err.message);
        }

        else {
            console.log(result);
            return res.status(200).json({ orderid: result.id, keyid: restaurant.razorpayCred.Key_id });
        }
    })
})
router.put("/food/order/acknowledge/:orderId", async (req, res) => {
    try{
    console.log("heree1")
    const order = await Order.findById(req.params.orderId);
    console.log("here2")
    order.paymentId=req.body.razorpay_payment_id;
    console.log("here3")
    order.Order_status = 'responsePending';
    console.log('here3')
    order.save();
    console.log('here4')
    console.log(req.body)
    console.log('here5')
    res.status(200).send({message: "Success"});
    }
    catch(e)
    {
        console.log("here6")
        console.log(e.message)
        res.status(400).json({message:"erooorrr"});
    }
})

module.exports = router;
