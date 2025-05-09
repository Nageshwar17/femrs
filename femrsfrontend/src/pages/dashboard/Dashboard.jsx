import React, { useState, useEffect } from "react";
import SideBar from "../../components/sideBar/SideBar";
import Equipment from "../../components/equipment/Equipment";
import styles from "./dashboard.module.css"; // Import CSS Module
import Bookings from "../../components/bookings/Bookings";
import AddEquipment from "../../components/forms/AddEquipment";
import { useNavigate } from 'react-router-dom';


const Dashboard = ({ user, setUser, refreshToken }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState([]);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();


  const openForm = () => setShowAddForm(true);
  const closeForm = () => setShowAddForm(false);
  

  const token = localStorage.getItem("access_token");  // ✅ This ensures the token persists


  const userType = user?.profile?.user_type || "guest";

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const response = await fetch("http://femrs.onrender.com/api/equipment/");
        if (!response.ok) throw new Error("Failed to fetch equipment.");
        const data = await response.json();
        console.log("Fetched Equipment Data:", data);
        setEquipments(data);
      } catch (err) {
        console.error("Error fetching equipment:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);



  return (
    <div className={styles.dashboard}>
      <SideBar userType={userType} setActiveTab={setActiveTab} />
      <main className={styles.content}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {activeTab === "home" && (
          <>
            <div className={styles.dashboardContainer}>
      <h1 className={styles.heading}>
        Welcome, {user ? user.profile.user.username : "Guest"}!
      </h1>

      {user ? (
        <div className={styles.card}>
          <div className={styles.column}>
            <h3 className={styles.userInfo}>User Information</h3>
            <p><strong>Full Name: </strong> {user.profile.user.first_name} {user.profile.user.last_name}</p>
            <p><strong>Email: </strong> {user.profile.user.email}</p>
            <p><strong>User Type: </strong> {user.profile.user_type}</p>
            <p><strong>Phone: </strong> {user.profile.phone_number}</p>
            <p>
              <strong>Date Joined: </strong>
              {user?.profile?.user?.date_joined
                ? new Date(user.profile.user.date_joined).toLocaleString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : "N/A"}
            </p>
          </div>

          
        </div>
      ) : (
        <p 
            className={styles.guestText} 
            onClick={() => navigate("/login")} 
            style={{ cursor: "pointer" }}
        >
          Please log in to see your dashboard.
        </p>

      )}
    </div>
          </>
        )}

        {activeTab === "equipment" && (
          <>
          <Equipment 
            userType={userType} 
            isAuthenticated={!!user} 
            equipments={equipments} 
            userId={user?.profile?.user?.id}  
            loading={loading} 
            onOpenAddForm={openForm}
            error={error}  
          />
          {showAddForm && <AddEquipment onClose={closeForm} />}
        </>
        )}

        {activeTab === "bookings" && (
          <Bookings 
          userId={user?.profile?.user.id}  // Ensure correct user ID is passed
          userToken={token}  // Ensure token is passed
          refreshToken={refreshToken}
          userType={userType} 
          isAuthenticated={!!user} 
        />
        
        )}
      </main>
    </div>
  );
};

export default Dashboard;
