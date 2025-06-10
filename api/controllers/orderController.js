const Order = require('../model/Order');
const User = require('../model/User');

// Create a new order (for both customer and distributor)
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress } = req.body;
        const userId = req.user._id;
        const userRole = req.user.role;

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderData = {
            customer: userId,
            items,
            totalAmount,
            shippingAddress
        };

        // If the user is a distributor, add distributor field
        if (userRole === 'distributor') {
            orderData.distributor = userId;
        }

        const order = new Order(orderData);
        await order.save();

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Marketing review order
exports.reviewOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { comments } = req.body;
        const marketingUserId = req.user._id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        order.status = 'reviewed';
        order.marketingReview = {
            reviewedBy: marketingUserId,
            reviewDate: new Date(),
            comments
        };

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Admin approve/reject order
exports.approveOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { comments, approved } = req.body;
        const adminUserId = req.user._id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        order.status = approved ? 'approved' : 'rejected';
        order.adminApproval = {
            approvedBy: adminUserId,
            approvalDate: new Date(),
            comments
        };

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Process payment for order
exports.processPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod, transactionId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.status !== 'approved') {
            return res.status(400).json({
                success: false,
                error: 'Order must be approved before payment'
            });
        }

        order.payment = {
            status: 'completed',
            amount: order.totalAmount,
            paymentDate: new Date(),
            paymentMethod,
            transactionId
        };
        order.status = 'paid';

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all orders (with filters)
exports.getOrders = async (req, res) => {
    try {
        const { status, role } = req.user;
        const query = {};

        // Filter based on user role
        if (role === 'customer') {
            query.customer = req.user._id;
        } else if (role === 'distributor') {
            query.distributor = req.user._id;
        }

        // Add status filter if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        const orders = await Order.find(query)
            .populate('customer', 'name email')
            .populate('distributor', 'name email')
            .populate('items.product', 'name price')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('customer', 'name email')
            .populate('distributor', 'name email')
            .populate('items.product', 'name price');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if user has permission to view this order
        const { role, _id } = req.user;
        if (role !== 'admin' && role !== 'marketing' && 
            order.customer._id.toString() !== _id.toString() && 
            order.distributor?._id.toString() !== _id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 