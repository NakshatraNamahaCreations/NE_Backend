const orderSchema = require("../../models/vendor/order");

// below on is working for old method
// exports.vendorOrder = async (req, res) => {
//   try {
//     const {
//       vendor_id,
//       vendor_name,
//       product,
//       delivery_address,
//       cart_value,
//       gst_applied_value,
//       paid_amount,
//       payment_method,
//       payment_status,
//       order_status,
//       ordered_date,
//     } = req.body;
//     const newOrder = new orderSchema({
//       vendor_id,
//       vendor_name,
//       product,
//       delivery_address,
//       cart_value,
//       gst_applied_value,
//       paid_amount,
//       payment_method,
//       order_status,
//       payment_status,
//       ordered_date,
//     });
//     await newOrder.save();
//     res.status(200).json({ message: "Order placed", order: newOrder });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.vendorOrder = async (req, res) => {
  try {
    // Extract the array of orders from the request body
    const orders = req.body;

    // Loop through each order in the array and save it to the database
    const savedOrders = await Promise.all(
      orders.map(async (orderData) => {
        const newOrder = new orderSchema(orderData);
        await newOrder.save();
        return newOrder;
      })
    );

    // Send a success response with all saved orders
    res.status(200).json({ message: "Orders placed", orders: savedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { return_reason, reason_command, returned_date } = req.body;

    const findOrder = await orderSchema.findOne({ order_id: orderId });

    if (!findOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    const updateOrder = await orderSchema.updateOne(
      { order_id: orderId },
      {
        $set: {
          order_status: "Order Returned",
          return_reason,
          reason_command,
          returned_date,
        },
      }
    );

    if (updateOrder.nModified === 0) {
      return res.status(400).json({ message: "Failed to return the order" });
    }

    const updatedOrder = await orderSchema.findOne({ order_id: orderId });

    res.status(200).json({ message: "Order returned", order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.vendorOrder = async (req, res) => {
//   try {
//     const orders = req.body.orders; // Expecting an array of order objects

//     if (!Array.isArray(orders)) {
//       return res.status(400).json({ message: "Invalid data format" });
//     }

//     const savedOrders = await Promise.all(
//       orders.map(async (orderData) => {
//         const newOrder = new orderSchema(orderData);
//         return await newOrder.save();
//       })
//     );

//     res.status(200).json({ message: "Orders placed", orders: savedOrders });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getVendorOrder = async (req, res) => {
  try {
    const vendorOrder = await orderSchema.find({
      vendor_id: String(req.params.id),
    });
    if (!vendorOrder) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json({ vendorOrder: vendorOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
