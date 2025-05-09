import React, { useState } from "react";
import styles from "./bookingForm.module.css";

const today = new Date().toISOString().split("T")[0];

const BookingForm = ({ userToken, isOpen, onClose, selectedEquipment }) => {
    const [formData, setFormData] = useState({
        shipping_address: "",
        pincode: "",
        rental_start_date: "",
        rental_end_date: "",
        total_days: 0,
       
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !selectedEquipment) return null;

    const calculateTotalDays = (start, end) => {
        if (!start || !end) return 0;

        const startDate = new Date(start);
        const endDate = new Date(end);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) return -1; // Prevents past dates
        if (endDate < startDate) return 0; // Prevents negative days

        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedForm = { ...formData, [name]: value };

        if (name === "rental_start_date" || name === "rental_end_date") {
            const days = calculateTotalDays(updatedForm.rental_start_date, updatedForm.rental_end_date);
            if (days === -1) {
                setError("Rental start date cannot be in the past.");
                return;
            }
            updatedForm.total_days = days;
            updatedForm.amount_payable = days > 0 ? days * selectedEquipment.price_per_day : 0;
        }

        if (name === "pincode" && !/^\d{0,6}$/.test(value)) {
            setError("Pincode must be a 6-digit number.");
            return;
        }

        setFormData(updatedForm);
        setError(""); // Clear errors when valid
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) throw new Error("No refresh token available");

            const response = await fetch("http://femrs.onrender.com/api/token/refresh/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to refresh token");

            localStorage.setItem("access_token", data.access);
            return data.access;
        } catch (err) {
            console.error("Token refresh failed:", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login"; // Redirect to login if refresh fails
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.total_days <= 0) {
            setError("Please select valid rental dates.");
            setLoading(false);
            return;
        }

        let token = userToken;

        const makeBookingRequest = async (accessToken) => {
            try {
                const requestBody = {
                    equipment: selectedEquipment?.id,
                    shipping_address: formData?.shipping_address,
                    pincode: formData?.pincode,
                    rental_start_date: formData?.rental_start_date,
                    rental_end_date: formData?.rental_end_date,
                    
                };
        
                console.log("Request Body:", requestBody); // Debugging
        
                const response = await fetch("http://femrs.onrender.com/api/bookings/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestBody),
                });
        
                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    throw new Error("Invalid response from server.");
                }
        
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Token expired");
                    }
                    throw new Error(data?.error || "Error processing booking.");
                }
                
                
                console.log("Booking created successfully, now redirecting to payment...");
                 // Call the payment function
                 const equipment_Id= selectedEquipment?.id;
                 const booking_Id = data?.id; 
                 handlePayment(equipment_Id, booking_Id);
            

            } catch (err) {
                console.error("Error making booking request:", err.message);
        
                if (err.message === "Token expired") {
                    console.log("Access token expired. Refreshing...");
                    try {
                        const newToken = await refreshAccessToken();
                        if (newToken) {
                            return await makeBookingRequest(newToken); // Retry with new token
                        } else {
                            setError("Session expired. Please log in again.");
                        }
                    } catch (refreshError) {
                        console.error("Error refreshing token:", refreshError.message);
                        setError("Session expired. Please log in again.");
                    }
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        
        // Call the function
        await makeBookingRequest(token);
        
        
    };



    const handlePayment = async (equipment_id, booking_id) => {
        if (formData.total_days <= 0) {
            setError("Please select valid rental dates.");
            return;
        }
    
        let token = localStorage.getItem("access_token");
        setLoading(true);
        setError("");
        onClose();
    
        try {
            const response = await fetch(`http://femrs.onrender.com/api/initiate-payment/${equipment_id}/${booking_id}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Payment initiation failed");
    
            
            const options = {
                key: "rzp_test_9k8wGNOqzslvTi", 
                amount: data.amount, // Ensure this matches backend
                currency: "INR",
                name: "Farm Equipment Rental",
                description: `Payment for ${selectedEquipment?.equipment_name}`,
                order_id: data.order_id, 
    
                handler: async function (paymentResponse) {
                    try {
                        const verifyResponse = await fetch("http://femrs.onrender.com/api/verify-payment/", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                equipment_id,
                                booking_id,
                                amount: data.amount, 
                                currency: "INR",
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();
                    if (!verifyResponse.ok) throw new Error(verifyData.error || "Payment verification failed");

                    // **Step 1: Call Payment Success API**
                    const successResponse = await fetch("http://femrs.onrender.com/api/payment-success/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                        }),
                    });

                    const successData = await successResponse.json();
                    if (!successResponse.ok) throw new Error(successData.error || "Payment success update failed");

                    alert("Payment successful! Booking confirmed.");
                    

                    } catch (err) {
                        console.error("Payment verification failed:", err);
                        setError("Payment verification failed. Please contact support.");
                    }
                },

                prefill: {
                    name: "Your Name", 
                    email: "your-email@example.com",
                    contact: "9999999999",
                },
                theme: { color: "#28a745" },
            };
    
            const rzp = new window.Razorpay(options);
            
            // Handle payment failure
            rzp.on("payment.failed", function (response) {
                console.error("Payment failed:", response);
                setError("Payment failed. Please try again.");
            });
    
            rzp.open();
        } catch (err) {
            console.error("Error in payment process:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    




    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Book Equipment</h2>
                <p><strong>Equipment:</strong> {selectedEquipment.equipment_name}</p>
                <p><strong>Price per day:</strong> ₹{selectedEquipment.price_per_day}</p>

                {error && <p className={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <label className={styles.label}>Shipping Address</label>
                    <textarea name="shipping_address" value={formData.shipping_address} onChange={handleChange} required className={styles.input} />

                    <label className={styles.label}>Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className={styles.input} />

                    <label className={styles.label}>Rental Start Date</label>
                    <input type="date" name="rental_start_date" min={today} value={formData.rental_start_date} onChange={handleChange} required className={styles.input} />

                    <label className={styles.label}>Rental End Date</label>
                    <input type="date" name="rental_end_date" min={today} value={formData.rental_end_date} onChange={handleChange} required className={styles.input} />

                    <p><strong>Total Days:</strong> {formData.total_days}</p>
                    <p><strong>Amount Payable:</strong> ₹{formData.amount_payable}</p>

                    <button type="submit" className={styles.button}  disabled={loading || formData.total_days <= 0}>
                        {loading ? "Processing......." : "Proceed to Pay"}
                    </button>
                    <button type="button" className={styles.closeButton} onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
