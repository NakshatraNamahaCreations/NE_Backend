const UserOrder = require("../../models/user/Order");

const notificationSchema = require("../../models/notifications/vendor-inapp");
const { default: axios } = require("axios");
const apiKey = process.env.SENDINBLUE_API_KEY;
const url = "https://api.brevo.com/v3/smtp/email";

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

const sendUserOrderEmail = async (
  orderID,
  orderDate,
  totalAmount,
  user_name,
  email
) => {
  const emailData = {
    sender: {
      name: "Nithyaevent",
      email: "support@nithyaevents.com",
    },
    to: [{ email: email, name: user_name }],
    subject: "Booking Confirmation - Nithyaevent",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* Include your CSS styles here */
        </style>
      </head>
      <body>
        <h4>Dear ${user_name},</h4>
        <p>Thank you for your booking with Nithyaevent!</p>

         <p>Below are the details of your booking:</p> 

        <p><strong>Order Number:</strong> INV${orderID}</p>
        <p><strong>Order Date:</strong> ${orderDate}</p>
        <p><strong>Total Amount:</strong> ${totalAmount}</p> 

        <p>If you have any questions about your order or need assistance, feel free to contact our support team.</p>
        <p>We look forward to serving you again!</p>

        <p>Best Regards,</p>
        <p><strong>Support Team</strong><br>Nithyaevent<br><a href="mailto:support@nithyaevent.com">support@nithyaevent.com</a> | 8867999997</p>
        <p>&copy; 2024 All Rights Reserved, Nithyaevent<br>Designed & Developed by Kadagam Ventures Private Limited</p>
      </body>
      </html>
    `,
  };
  try {
    const response = await axios.post(url, emailData, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    });
    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send onboarding email");
  }
};

exports.userOrder = async (req, res) => {
  try {
    const {
      product_data,
      service_data,
      tech_data,
      receiver_mobilenumber,
      receiver_name,
      venue_name,
      // setup_start_date,
      // setup_end_date,
      setup_date,
      rehearsal_date,
      setup_start_time,
      setup_end_time,
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
      user_mailid,
      user_mobile_number,
      event_date,
      event_start_date,
      event_end_date,
      number_of_days,
      event_name,
      ordered_date,
      location_lat,
      location_long,
      vendors_message,
      booking_from,
    } = req.body;

    const SMS_TYPE = "delivery_template";

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
      setup_start_time,
      setup_end_time,
      // setup_start_date,
      // setup_end_date,
      setup_date,
      rehearsal_date,
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
      user_mailid,
      user_mobile_number,
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
      booking_from,
      otp: Math.floor(Math.random() * 9000) + 1000,
    });
    await newOrder.save();
    // Notify the vendors about the order
    for (const product of parsedProductData) {
      const productNotification = {
        vendor_id: product.sellerId,
        notification_type: "product_booking",
        message: `Your product "${product.productName}" has been booked for the ${event_name} from ${event_date}.`,
        product_id: product.id,
        metadata: { user_id, order_status },
        status: "unread",
        created_at: new Date(),
      };
      await notificationSchema.create(productNotification);
    }
    for (const service of parsedServiceData) {
      const serviceNotification = {
        vendor_id: service.sellerId,
        notification_type: "service_booking",
        message: `Your Service "${service.productName}" has been booked for the ${event_name} from ${event_date}.`,
        product_id: service.id,
        metadata: { user_id, order_status },
        status: "unread",
        created_at: new Date(),
      };
      await notificationSchema.create(serviceNotification);
    }
    // mail the user with the order details
    const deliveryMessage = `Hello Naveen,Your one-time`;
    try {
      await sendUserOrderEmail(
        newOrder._id.toString().slice(-6),
        ordered_date,
        paid_amount,
        user_name,
        user_mailid
      );
      // await sendSMS(user_mobile_number, deliveryMessage, SMS_TYPE);
    } catch (error) {
      console.error("Order email error:", error.message);
      return res
        .status(500)
        .json({ message: "Order placed, but failed to send email" });
    }
    res.status(200).json({ message: "Order placed", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    const allProduct = await UserOrder.find().sort({ _id: -1 });

    if (allProduct.length < 0) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json(allProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getSellerProducts = async (req, res) => {
//   try {
//     const sellerId = req.params.id;

//     const allOrders = await UserOrder.find();

//     const filteredResponse = allOrders
//       .map((order) => {
//         const filteredProducts = order.product_data.filter(
//           (product) => product.sellerId === sellerId
//         );

//         if (filteredProducts.length > 0) {
//           return {
//             _id: order._id,
//             event_name: order.event_name,
//             ...order._doc,
//             product_data: filteredProducts,
//           };
//         }
//         return null;
//       })
//       .filter(Boolean);

//     console.log("filteredResponse", filteredResponse);

//     if (filteredResponse.length === 0) {
//       console.log("No products found for this seller");
//       return res.status(404).json({ message: "Products not found" });
//     }

//     return res.status(200).json(filteredResponse);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getSellerProducts = async (req, res) => {
  // this api for to show the count of vendor's orders (Products registered vendor)
  try {
    const sellerId = req.params.id;
    const { order_status } = req.query;

    const allOrders = await UserOrder.find().sort({ _id: -1 });

    const filteredResponse = allOrders
      .map((order) => {
        // Filter the products based on sellerId
        const filteredProducts = order.product_data.filter(
          (product) => product.sellerId === sellerId
        );

        // Normalize the order_status from frontend and from DB to lowercase
        const normalizedStatus = order_status?.trim().toLowerCase();

        // Normalize order_status of the order itself
        const orderStatus = order?.order_status?.trim().toLowerCase() || ""; // Normalize order status

        // Handle filtering logic based on order_status
        let statusMatch = false;
        if (!order_status || normalizedStatus === "all") {
          statusMatch = true; // Show all statuses
        } else {
          statusMatch = orderStatus === normalizedStatus;
        }

        // If filtered products are found and status matches, return the order
        if (filteredProducts.length > 0 && statusMatch) {
          return {
            _id: order._id,
            event_name: order.event_name,
            order_status: order.order_status, // Include the order status at the root level
            product_data: filteredProducts,
            eventStartDate: order.event_start_date,
            eventEndDate: order.event_end_date,
          };
        }

        return null;
      })
      .filter(Boolean);

    // console.log("filteredResponse", filteredResponse.length); // Log the number of filtered results

    if (filteredResponse.length === 0) {
      return res.status(404).json({ message: "No data available" });
    }

    return res.status(200).json({ filteredResponse }); // Ensure the response has filteredResponse property
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getSellerProducts = async (req, res) => {
//   try {
//     const sellerId = req.params.id;
//     const { order_status } = req.query;
//     const allOrders = await UserOrder.find().sort({ _id: -1 });

//     const filteredResponse = allOrders
//       .map((order) => {
//         const filteredProducts = order.product_data.filter((product) => {
//           const sellerMatch = product.sellerId === sellerId;

//           const statusMatch = order_status
//             ? order_status === "Order Delivered"
//               ? product?.order_status?.trim().toLowerCase() ===
//                 order_status.trim().toLowerCase()
//               : order?.order_status?.trim().toLowerCase() ===
//                 order_status.trim().toLowerCase()
//             : false;

//           return sellerMatch && statusMatch;
//         });
//         if (filteredProducts.length > 0) {
//           return {
//             _id: order._id,
//             event_name: order.event_name,
//             ...order._doc,
//             product_data: filteredProducts,
//           };
//         }
//         return null;
//       })
//       .filter(Boolean);
//     console.log("filteredResponse", filteredResponse);
//     if (filteredResponse.length === 0) {
//       return res.status(404).json({ message: "No data available" });
//     }
//     return res.status(200).json(filteredResponse);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getServiceOrders = async (req, res) => {
  // this api for to show the count of vendor's orders (service registered vendor)
  try {
    const sellerId = req.params.id;
    const { order_status } = req.query;

    const allOrders = await UserOrder.find().sort({ _id: -1 });

    const filteredResponse = allOrders
      .map((order) => {
        // Filter the products based on sellerId
        const filteredService = order.service_data.filter(
          (service) => service.sellerId === sellerId
        );

        // Normalize the order_status from frontend and from DB to lowercase
        const normalizedStatus = order_status?.trim().toLowerCase();

        // Normalize order_status of the order itself
        const orderStatus = order?.order_status?.trim().toLowerCase() || ""; // Normalize order status

        // Handle filtering logic based on order_status
        let statusMatch = false;
        if (!order_status || normalizedStatus === "all") {
          statusMatch = true; // Show all statuses
        } else {
          statusMatch = orderStatus === normalizedStatus;
        }

        // If filtered products are found and status matches, return the order
        if (filteredService.length > 0 && statusMatch) {
          return {
            _id: order._id,
            event_name: order.event_name,
            order_status: order.order_status, // Include the order status at the root level
            service_data: filteredService,
            eventStartDate: order.event_start_date,
            eventEndDate: order.event_end_date,
          };
        }

        return null;
      })
      .filter(Boolean);

    // console.log("filteredResponse", filteredResponse.length); // Log the number of filtered results

    if (filteredResponse.length === 0) {
      return res.status(404).json({ message: "No data available" });
    }

    return res.status(200).json({ filteredResponse }); // Ensure the response has filteredResponse property
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// old api
// exports.getServiceOrders = async (req, res) => {
//   try {
//     const sellerId = req.params.id;

//     const allOrders = await UserOrder.find();

//     const filteredResponse = allOrders
//       .map((order) => {
//         const filteredService = order.service_data.filter(
//           (service) => service.sellerId === sellerId
//         );

//         if (filteredService.length > 0) {
//           return {
//             _id: order._id, // Include the order ID
//             event_name: order.event_name, // Include the event name
//             ...order._doc, // Spread all other properties of the order
//             service_data: filteredService, // Include only filtered products
//           };
//         }
//         return null; // Exclude orders without matching products
//       })
//       .filter(Boolean); // Remove null values

//     // If no products are found, return 404
//     if (filteredResponse.length === 0) {
//       return res.status(404).json({ message: "service not found" });
//     }

//     // Return the filtered response
//     return res.status(200).json(filteredResponse);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getUserOrderByUserId = async (req, res) => {
  try {
    const userOrder = await UserOrder.find({
      user_id: String(req.params.id),
    }).sort({ _id: -1 });
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
    // console.log("orderId", orderId);

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
      setup_start_time: req.body.setup_start_time || findEvent.setup_start_time,
      setup_end_time: req.body.setup_end_time || findEvent.setup_end_time,
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

exports.addDeliveryImges = async (req, res) => {
  const { vendor_id, vendor_name, image_type } = req.body;
  const findEvent = await UserOrder.findOne({ _id: req.params.id });
  if (!findEvent) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (req.body.image_url) {
    findEvent.image_url = req.body.image_url;
  }
  findEvent.event_setup.push({
    vendor_id,
    vendor_name,
    image_type,
    image_url: req.body.image_url,
    createdDate: new Date(),
  });
  const updatedEvent = await UserOrder.updateOne(
    { _id: req.params.id },
    findEvent
  );
  res.status(200).json({
    status: true,
    success: "Success",
    data: updatedEvent,
  });
};

exports.getEventSetupImages = async (req, res) => {
  try {
    const findEvent = await UserOrder.findOne({ _id: req.params.id });
    if (!findEvent) {
      return res.status(404).json({ message: "Order not found" });
    }

    const vendorId = req.query.vendor_id;
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    const filteredSetupImage = findEvent.event_setup.filter(
      (item) => item.vendor_id === vendorId
    );

    return res.status(200).json({
      status: true,
      success: "Success",
      data: filteredSetupImage,
    });
  } catch (error) {
    console.error("Error fetching setup images:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deliveryOrder = async (req, res) => {
  try {
    const { otp, delivered_date, productIds, bookingType } = req.body;
    console.log("productIds", productIds);

    const order = await UserOrder.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.otp !== otp) {
      return res.status(400).json({ message: "OTP is incorrect" });
    }
    const findBookingType =
      bookingType === "Product" ? order.product_data : order.service_data;
    console.log("findBookingType", bookingType);

    const newProductData = findBookingType.map((product) => {
      if (productIds.includes(product.id)) {
        return {
          ...product,
          order_status: "Order Delivered",
          delivered_date: delivered_date || new Date(),
        };
      }
      return product;
    });

    const updateField =
      bookingType === "Product"
        ? { product_data: newProductData }
        : { service_data: newProductData };

    const updateStatus = await UserOrder.updateOne(
      { _id: req.params.id },
      {
        $set: updateField,
      }
    );

    // const updateStatus = await UserOrder.updateOne(
    //   { _id: req.params.id },
    //   {
    //     $set: {
    //       order_status: "Order Delivered",
    //       delivered_date: delivered_date || new Date(),
    //     },
    //   }
    // );
    res.status(200).json({
      status: "Selected items marked as delivered",
      order: updateStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getSellerProducts = async (req, res) => {
//   try {
//     const sellerId = req.params.id;
//     const { order_status } = req.query;
//     const allOrders = await UserOrder.find().sort({ _id: -1 });

//     const filteredResponse = allOrders
//       .map((order) => {
//         const filteredProducts = order.product_data.filter((product) => {
//           const sellerMatch = product.sellerId === sellerId;
//           // const statusMatch = order_status
//           //   ? product.order_status?.trim().toLowerCase() ===
//           //     order_status.trim().toLowerCase()
//           //   : true;
//           const statusMatch = order_status
//             ? order_status === "Order Delivered"
//               ? product?.order_status?.trim().toLowerCase() ===
//                 order_status.trim().toLowerCase()
//               : order?.order_status?.trim().toLowerCase() ===
//                 order_status.trim().toLowerCase()
//             : true;
//           console.log("Product Status:", product.order_status);

//           return sellerMatch && statusMatch;
//         });
//         if (filteredProducts.length > 0) {
//           return {
//             _id: order._id,
//             event_name: order.event_name,
//             ...order._doc,
//             product_data: filteredProducts,
//           };
//         }
//         return null;
//       })
//       .filter(Boolean);
//     if (filteredResponse.length === 0) {
//       return res.status(404).json({ message: "Products not found" });
//     }
//     return res.status(200).json(filteredResponse);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
