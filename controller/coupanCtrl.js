const Coupon = require('../models/coupanModel')

const loadAddCoupon = async (req, res) => {
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const coupons = await Coupon.find().sort({_id:-1}) 
        res.render('coupan',{
            adminEmail,
            adminName,
            coupons
        });
    } catch (error) {
        console.log(error.message);
    }
};

const saveCoupon = async (req, res) => {
    try {
        const { couponCode, discountAmount, maxUses, expirationDate, startDate, minPurchaseAmount } = req.body;
        const existing = await Coupon.findOne({couponCode})
        console.log(req.body);
        if(existing){
            return res.status(404).json({ error: 'Already Existing Code' });
        }

        const coupon = new Coupon({
            couponCode,
            discountAmount,
            maxUses,
            minPurchaseAmount,
            startDate: new Date(startDate),
            expirationDate: new Date(expirationDate), // Convert to Date object
        });

        const couponData = await coupon.save();
        console.log(couponData);
        res.status(201).json({ message: 'Coupon added successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addCoupon = async (req, res) => {
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        res.render('add-coupan',{
            adminEmail,
            adminName
        });
    } catch (error) {
        console.error(error.message);
    }
};

const verifyCoupon = async (req, res) => {
    try {
        const { couponCode, totalAmount } = req.body;
        const userId = req.session.user;

        const validationResult = await validateCoupon(couponCode, totalAmount, userId);
        console.log("validationResult",validationResult);

        if (validationResult.isValid) {

            const discountAmount = calculateDiscount(validationResult.coupon, totalAmount);

            const update = await Coupon.findByIdAndUpdate(validationResult.coupon._id, {
                $inc: { usedCount: 1 },
                $addToSet: { usersApplied: userId }, // Add the user's ID to the array if not already present
            });

            res.json({
                success: true,
                message: 'Coupon applied successfully',
                discountAmount: discountAmount,
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid coupon',
                errors: validationResult.errors,
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const validateCoupon = async (couponCode, totalAmount, userId) => {
    try {
        const coupon = await Coupon.findOne({ couponCode: couponCode });
       
        if (!coupon) {
            return { isValid: false, errors: ['Invalid coupon code'] };
        }

        const currentDate = new Date();
        if (coupon.expirationDate < currentDate) {
            return { isValid: false, errors: ['Coupon has expired'] };
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return { isValid: false, errors: ['Coupon has reached its maximum usage limit'] };
        }

        if (totalAmount <= coupon.minPurchaseAmount) {
            return { isValid: false, errors: ['Minimum amount not met'] };
        }

        
        // Check if the user has already applied the coupon
        // const userAppliedIndex = coupon.usersApplied.findIndex((appliedUserId) => appliedUserId.equals(userId));
        // if (userAppliedIndex !== -1) {
            
        //     return { isValid: false, errors: ['Coupon has already been applied by this user'] };
        // }

        // If all checks pass, the coupon is considered valid
        return { isValid: true, coupon: coupon, errors: [] };

    } catch (error) {
        console.error(error);
        return { isValid: false, errors: ['Error validating coupon'] };
    }
};

const calculateDiscount = (coupon, totalAmount) => {
    const discountAmount = (coupon.discountAmount / 100) * totalAmount;
    return discountAmount;
};

const getCoupon = async (req, res) => {
    try {
        const { totalAmount } = req.body;
        const coupon = await Coupon.findOne({ minPurchaseAmount: { $lte: totalAmount } })
        .sort({minPurchaseAmount: -1});
        console.log(coupon);
        if (coupon) {
            res.json({ success: true, coupon: coupon });
        } else {
            res.json({ success: false, coupon: null });
        }

    } catch (error) {
        console.error('Error retrieving coupon:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        await Coupon.findByIdAndDelete(couponId);
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    loadAddCoupon,
    addCoupon,
    saveCoupon,
    deleteCoupon,
    verifyCoupon,
    getCoupon,
}