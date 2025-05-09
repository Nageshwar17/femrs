import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUserRound, Briefcase, BookCheck, UnfoldHorizontal } from "lucide-react";
import styles from "./sidebar.module.css"; // Import CSS module

const Sidebar = ({ userType, setActiveTab }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true); // Sidebar state

  return (
    <>
      {/* 🔹 Toggle Button Stays Fixed in the Top-Left */}
      <button className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar" >
        <UnfoldHorizontal size={24} />
      </button>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>

        <h2>Dashboard</h2>
        <button onClick={() => setActiveTab("home")}>
          <CircleUserRound size={20} /> <span>Profile</span>
        </button>
        <button onClick={() => setActiveTab("bookings")}>
          <BookCheck size={20} /> <span>Bookings</span>
        </button>
        
        
        <button onClick={() => navigate("/")}>🏠 <span>Back to Home</span></button>
      </aside>
    </>
  );
};

export default Sidebar;
