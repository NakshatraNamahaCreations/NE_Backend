const UserOrder = require("../../models/user/Order");

// exports.userOrder = async (req, res) => {
//   try {
//     const orders = req.body;
//     console.log("orders", orders);

//     const savedOrders = await Promise.all(
//       orders?.map(async (orderData) => {
//         const newOrder = new UserOrder(orderData);
//         await newOrder.save();
//         return newOrder;
//       })
//     );
//     if (!savedOrders) {
//       return res.status(404).json({ message: "Order not found" });
//     }
//     res.status(200).json({ message: "Orders placed", success: savedOrders });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.userOrder = async (req, res) => {
//   try {
//     const { constructingCart } = req.body; // Extract 'constructingCart' array from the request body
//     console.log("constructingCart", constructingCart);

//     if (!Array.isArray(constructingCart)) {
//       return res.status(400).json({ message: "Invalid order data" });
//     }

//     const savedOrders = await Promise.all(
//       constructingCart.map(async (orderData) => {
//         const newOrder = new UserOrder(orderData);
//         await newOrder.save();
//         return newOrder;
//       })
//     );

//     if (!savedOrders || savedOrders.length === 0) {
//       return res.status(404).json({ message: "Orders not found" });
//     }

//     res.status(200).json({ message: "Orders placed", success: savedOrders });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.userOrder = async (req, res) => {
  try {
    const {
      product_data,
      service_data,
      tech_data,
      receiver_mobilenumber,
      receiver_name,
      venue_name,
      venue_open_time,
      event_start_time,
      event_end_time,
      event_location,
      gst_applied_value,
      base_amount,
      tds_deduction,
      amount_after_deduction,
      cart_total,
      paid_amount,
      payment_method,
      payment_status,
      order_status,
      user_id,
      user_name,
      event_date,
      event_start_date,
      event_end_date,
      number_of_days,
      event_name,
      ordered_date,
      location_lat,
      location_long,
      vendors_message,
    } = req.body;

    const parsedProductData = JSON.parse(product_data);
    const parsedServiceData = JSON.parse(service_data);
    const parsedTechData = JSON.parse(tech_data);

    // const gatepassImage = req.files["upload_gatepass"]
    //   ? req.files["upload_gatepass"][0].path
    //   : null;
    // const invitationImage = req.files["upload_invitation"]
    //   ? req.files["upload_invitation"][0].path
    //   : null;

    const newOrder = new UserOrder({
      product_data: parsedProductData,
      service_data: parsedServiceData,
      tech_data: parsedTechData,
      receiver_mobilenumber,
      receiver_name,
      venue_name,
      venue_open_time,
      event_start_time,
      event_end_time,
      event_location,
      gst_applied_value,
      base_amount,
      tds_deduction,
      amount_after_deduction,
      cart_total,
      paid_amount,
      payment_method,
      payment_status,
      order_status,
      user_id,
      user_name,
      event_date,
      event_start_date,
      event_end_date,
      number_of_days,
      event_name,
      ordered_date,
      upload_gatepass: req.body.upload_gatepass,
      upload_invitation: req.body.upload_invitation,
      location_lat,
      location_long,
      vendors_message,
    });
    await newOrder.save();
    res.status(200).json({ message: "Order placed", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    const allProduct = await UserOrder.find();

    if (allProduct.length < 0) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json(allProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Fetch all orders
    const allOrders = await UserOrder.find();

    // Build the filtered response
    const filteredResponse = allOrders
      .map((order) => {
        // Filter product_data for the specified sellerId
        const filteredProducts = order.product_data.filter(
          (product) => product.sellerId === sellerId
        );

        // Return individual objects for each matching order with relevant data
        if (filteredProducts.length > 0) {
          return {
            _id: order._id, // Include the order ID
            event_name: order.event_name, // Include the event name
            ...order._doc, // Spread all other properties of the order
            product_data: filteredProducts, // Include only filtered products
          };
        }
        return null; // Exclude orders without matching products
      })
      .filter(Boolean); // Remove null values

    // If no products are found, return 404
    if (filteredResponse.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }

    // Return the filtered response
    return res.status(200).json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserOrder = async (req, res) => {
  try {
    const userOrder = await UserOrder.find({
      user_id: String(req.params.id),
    });
    if (!userOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ userOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderByOrderId = async (req, res) => {
  try {
    const orderId = await UserOrder.findOne({
      _id: String(req.params.id),
    });
    if (!orderId) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { cancel_reason, cancelled_date } = req.body;
    const order = await UserOrder.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const updateStatus = await UserOrder.updateOne(
      { _id: req.params.id },
      {
        $set: {
          order_status: "Order Cancelled",
          cancel_reason: cancel_reason || "No reason provided",
          cancelled_date: cancelled_date || new Date(),
        },
      }
    );
    res.status(200).json({ status: "Order Cancelled", order: updateStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCancelledOrder = async (req, res) => {
  try {
    const cancelEvents = await UserOrder.find({
      order_status: "Order Cancelled",
    });
    if (!cancelEvents) {
      return res.status(404).json({ message: "No cancel event's" });
    }
    res.status(200).json({ cancelEvents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rescheduleOrder = async (req, res) => {
  try {
    const eventId = req.params.id;

    const findEvent = await UserOrder.findOne({ _id: eventId });
    if (!findEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!req.body.location_lat || !req.body.location_long) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required." });
    }

    const updatedData = {
      receiver_mobilenumber:
        req.body.receiver_mobilenumber || findEvent.receiver_mobilenumber,
      receiver_name: req.body.receiver_name || findEvent.receiver_name,
      venue_name: req.body.venue_name || findEvent.venue_name,
      venue_open_time: req.body.venue_open_time || findEvent.venue_open_time,
      event_start_time: req.body.event_start_time || findEvent.event_start_time,
      event_end_time: req.body.event_end_time || findEvent.event_end_time,
      event_location: req.body.event_location || findEvent.event_location,
      order_status: req.body.order_status || findEvent.order_status,
      event_date: req.body.event_date || findEvent.event_date,
      event_start_date: req.body.event_start_date || findEvent.event_start_date,
      event_end_date: req.body.event_end_date || findEvent.event_end_date,
      number_of_days: req.body.number_of_days || findEvent.number_of_days,
      event_name: req.body.event_name || findEvent.event_name,
      ordered_date: req.body.ordered_date || findEvent.ordered_date,
      location_lat: req.body.location_lat || findEvent.location_lat,
      location_long: req.body.location_long || findEvent.location_long,
      rescheduled_date: req.body.rescheduled_date || findEvent.rescheduled_date,
      reschedule_remark:
        req.body.reschedule_remark || findEvent.reschedule_remark,
      upload_invitation: req.body.upload_invitation,
      upload_gatepass: req.body.upload_gatepass,
    };

    const updateDetails = await UserOrder.findByIdAndUpdate(
      eventId,
      updatedData,
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Event Rescheduled", events: updateDetails });
  } catch (error) {
    console.error("Error in rescheduleOrder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getRescheduledOrder = async (req, res) => {
  try {
    const rescheduledEvents = await UserOrder.find({
      order_status: "Order Rescheduled",
    });
    if (!rescheduledEvents) {
      return res.status(404).json({ message: "No Rescheduled event's" });
    }
    res.status(200).json({ rescheduledEvents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// update in server
exports.raiseTickets = async (req, res) => {
  try {
    const order = await UserOrder.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const updateStatus = await UserOrder.updateOne(
      { _id: req.params.id },
      {
        $set: {
          order_status: "Ticket Raised",
        },
      }
    );
    res.status(200).json({ status: "Ticket Raised", order: updateStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { return_reason, reason_command, returned_date } = req.body;

    const findOrder = await UserOrder.findOne({ _id: orderId });

    if (!findOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    const updateOrder = await UserOrder.updateOne(
      { _id: orderId },
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
    const updatedOrder = await UserOrder.findOne({ _id: orderId });
    res.status(200).json({ message: "Order returned", order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
