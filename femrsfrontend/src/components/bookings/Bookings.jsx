import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../card/Card";

import styles from "./bookings.module.css";

const Bookings = ({ userId, userToken, refreshToken, setUserToken, userType }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null); // for opening the modal
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });


  const fetchBookings = async (token = userToken) => {
    try {
      const response = await fetch("http://localhost:8000/api/bookings/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 401) {
        console.warn("Access token expired. Attempting to refresh...");
        await refreshAccessToken();
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
  
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;
  
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 401) {
        console.warn("Access token expired. Attempting to refresh...");
        await refreshAccessToken();
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to cancel booking.");
      }
  
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
  

  const handleReviewSubmit = async (equipmentId) => {
    try {
      const response = await fetch("http://localhost:8000/api/reviews/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipment: equipmentId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          user: userId
        }),
      });
  
      if (!response.ok) {
        throw new Error("Review Already Taken.");
      }
  
      alert("Review submitted successfully!");
      setSelectedBooking(null); // close modal
    } catch (err) {
      alert("Error submitting review: " + err.message);
    }
  };
  

  const handleOpenReviewModal = async (equipmentId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/reviews/?equipment_id=${equipmentId}`, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": "application/json",
        }
      });
  
      const data = await response.json();
      const myReview = data.find(r => r.user === userId); // Check if user already reviewed
  
      if (myReview) {
        setReviewData({
          rating: myReview.rating,
          comment: myReview.comment,
        });
      } else {
        setReviewData({ rating: 5, comment: "" });
      }
  
      const booking = bookings.find(b => b.equipment.id === equipmentId);
      setSelectedBooking(booking);
    } catch (err) {
      console.error("Error fetching review:", err);
    }
  };
  


  const refreshAccessToken = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }
  
      const data = await response.json();
      setUserToken(data.access); // Update token in state/context
      console.log("🔐 Refreshed Access Token:",data.access); // <- Add this line
      
      // Wait for state to update before making request
      fetchBookings(data.access);
    } catch (err) {
      setError("Session expired.");
      window.location.reload(); // Refresh the page
    }
  };
  

  useEffect(() => {
    if (userId && userToken) {
      fetchBookings(userToken);
    }
  }, [userId, userToken]);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.bookingGrid}>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id} className={styles.bookingCard}>
            <img
              src={booking.equipment.image2}
              alt={booking.equipment.equipment_name}
              className={styles.bookingImage}
            />
            <CardContent className={styles.cardContent}>
              <h6 className={styles.bookingTitle}>{booking.equipment.equipment_name}</h6>
              <p className={styles.bookingDate}>
                Booked From: {booking.rental_start_date} To {booking.rental_end_date}
              </p>
              <p className={styles.bookingPrice}>Total Days: {booking.total_days}</p>
              <p className={styles.bookingPrice}>Total Price: ₹{booking.payment.amount}</p>
              <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => handleCancelBooking(booking.id)}
              >
                Cancel Booking
              </button>
              {userType !== "owner" && (
                <button
                  className={styles.reviewButton}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setReviewData({ rating: 5, comment: "" });
                  }}
                >
                  Rate & Review
                </button>
              )}

              </div>
            </CardContent>
          </Card>
        ))
      )}

{selectedBooking && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h3>Rate & Review: {selectedBooking.equipment.equipment_name}</h3>
      <label>
        Rating:
        <select
          value={reviewData.rating}
          onChange={(e) => setReviewData({ ...reviewData, rating: parseFloat(e.target.value) })}
        >
          {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((val) => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Comment:
        <textarea
          value={reviewData.comment}
          onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
        />
      </label>
      <br />
      <div className={styles.modalButtons}>
        <button onClick={() => handleOpenReviewModal(selectedBooking.equipment.id)}>View</button>
        <button onClick={() => handleReviewSubmit(selectedBooking.equipment.id)}>Submit</button>
        <button onClick={() => setSelectedBooking(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Bookings;
