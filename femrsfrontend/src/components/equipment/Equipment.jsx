import React, { useState } from "react";
import { Button, Card, CardContent } from "../card/Card";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";
import styles from "./equipment.module.css";
import BookingForm from "../bookingForm/BookingForm";

const EquipmentList = ({
  equipments,
  loading,
  error,
  userType,
  isAuthenticated,
  userToken,
  userId,
  onOpenAddForm,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  if (loading) {
  return (
    <div className={styles.equipmentGrid}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonText} />
          <div className={styles.skeletonTextShort} />
          <div className={styles.skeletonButton} />
        </div>
      ))}
    </div>
  );
}


  if (error) {
    return (
      <div className={styles.errorFallback}>
        <img
          src="error.svg"
          alt="Error"
          className={styles.errorImage}
        />
        <h2>Something went wrong</h2>
        <p>We couldn't load the equipment list. Please try again later.</p>
        <Button className={styles.retryButton} onClick={() => window.location.reload()}>
          🔄 Retry
        </Button>
      </div>
    );
  }

  // Filter equipment based on user type
  const filteredEquipments = equipments.filter((equipment) => {
    if (userType === "farmer") return equipment.available === true;
    if (userType === "owner") return equipment.user.id === userId;
    return true;
  });

  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = fullStars + (hasHalfStar ? 1 : 0);
    const emptyStars = 5 - totalStars;

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={styles.fullStar} />
        ))}
        {hasHalfStar && <StarHalf key="half" className={styles.fullStar} />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarOutline key={`empty-${i}`} className={styles.emptyStar} />
        ))}
      </>
    );
  };

  return (
    <div className={styles.equipmentGrid}>
      {filteredEquipments.length === 0 ? (
        <p>No equipment available.</p>
      ) : (
        filteredEquipments.map((equipment) => (
          <Card key={equipment.id} className={styles.equipmentCard}>
            <img
              src={equipment.image2}
              alt={equipment.equipment_name}
              className={styles.equipmentImage}
            />
            <CardContent className={styles.cardContent}>
              <p className={styles.equipmentLocation}>
                {`${equipment.sub_district}, ${equipment.district}, ${equipment.state}, ${equipment.pin_code}`}
              </p>
              <h6 className={styles.equipmentTitle}>
                {equipment.equipment_name}
              </h6>

              <div className={styles.priceRating}>
                <div className={styles.starRating}>
                  {renderStars(equipment.average_rating)}
                  <span className={styles.ratingValue}>
                    {(equipment.average_rating || 0).toFixed(1)}
                  </span>
                </div>
                <p className={styles.equipmentPrice}>
                  ₹{equipment.price_per_day} /day
                </p>
              </div>

              {userType === "owner" ? (
                <p>✅ Added</p>
              ) : (
                <Button
                  className={styles.bookButton}
                  onClick={() => {
                    if (isAuthenticated) {
                      setSelectedEquipment(equipment);
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                >
                  Book Now
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {selectedEquipment && (
        <BookingForm
          userToken={userToken}
          isOpen={!!selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          selectedEquipment={selectedEquipment}
        />
      )}

      {userType === "owner" && (
        <Button onClick={onOpenAddForm} className={styles.addButton}>
          Add New Equipment
        </Button>
      )}

      {showLoginModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Please Log In</h2>
            <p className={styles.modalText}>
              You need to log in to book equipment.
            </p>
            <Button
              className={styles.loginButton}
              onClick={() => (window.location.href = "/login/")}
            >
              Login
            </Button>
            <Button
              className={styles.closeButton}
              onClick={() => setShowLoginModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
