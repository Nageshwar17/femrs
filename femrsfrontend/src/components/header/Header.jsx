import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./header.module.css";
import logo from "../../assets/logo.png";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/MenuRounded";
import PersonIcon from "@mui/icons-material/AccountCircle";
import MyEquipmentIcon from '@mui/icons-material/Dashboard';
import AddEquipmentIcon from '@mui/icons-material/AddRounded';
import axios from "axios";
import Equipment from "../equipment/Equipment";
import Fuse from "fuse.js";


const Header = ({ user, setUser, equipments, loading, error, userType, onOpenAddForm, refreshToken, onOpenBookingForm, isAuthenticated }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    

  // Ensure `equipments` is always an array (to prevent crashes)
  const validEquipments = Array.isArray(equipments) ? equipments.filter(e => e.equipment_name) : [];

 
const filteredEquipments = searchTerm.trim().length >= 3
  ? (() => {
      // Initialize Fuse.js with fields to search
      const fuse = new Fuse(validEquipments, {
        keys: ["equipment_name", "sub_district", "district", "state"], // Fields to search
        threshold: 0.3, // Lower = more strict, Higher = more fuzzy
        findAllMatches: true,
        includeScore: false
      });

      // Perform fuzzy search
      return fuse.search(searchTerm).map(result => result.item);
    })()
  : [];

  
  const goToDashboard = () => {
    navigate("/dashboard", { state: { refreshToken } });
};

    const handleLogout = async () => {
        if (!window.confirm("Are you sure you want to log out?")) return;

        try {
            await axios.post("http://femrs.onrender.com/api/logout/", {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            sessionStorage.clear();

            setUser(null);
            navigate("/home", { replace: true });
        }
    };

    return (
        <>
        <header className={styles.header}>
            <div className={styles.logoName} onClick={() => navigate("/home")}>
                <img src={logo} className={styles.logo} alt="Logo" />
            </div>

            <div className={styles.search}>
                <div className={styles.searchBox}>
                    <div className={styles.searchIcon}>
                        <SearchIcon sx={{ fontSize: 36 }} />
                    </div>
                    <input
                        type="text"
                        onChange={(event) => {setSearchTerm(event.target.value)}}
                        className={styles.searchInput}
                        placeholder="Search..."
                        autoComplete="off"
                    />
                </div>
            </div>

            <nav className={styles.navigation}>
                {user ? (
                    <>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </>
                ) : (
                    <div className={styles.navItem} onClick={() => navigate("/login")}>
                        <PersonIcon className={styles.icon} />
                        <span>Login</span>
                    </div>
                )}

                <div className={styles.menuContainer}>
                    <MenuIcon 
                        sx={{ fontSize: 36 }} 
                        className={styles.moreOptions} 
                        onClick={() => setShowDropdown(!showDropdown)} 
                    />
                    {showDropdown && (
                        <ul className={styles.dropdownMenu} onMouseLeave={() => setShowDropdown(false)}>
                            <li onClick={goToDashboard}> <MyEquipmentIcon sx={{ fontSize: 20, marginRight: "8px" }} /> My Dashboard</li>
                            {user && (
                                <>
                                    
                                    {user.profile.user_type === 'owner' ? (
                                        <>
                                            
                                            <li onClick={onOpenAddForm}> <AddEquipmentIcon sx={{ fontSize: 20 }} /> Add Equipment</li>
                                        </>
                                    ) : (
                                        <>
                                            
                                            
                                        </>
                                    )}
                                </>
                            )}
                        </ul>
                    )}
                </div>
            </nav>
        </header>
        

        

        {/* Show results only if searchTerm is not empty AND there are filtered results */}
      {searchTerm.trim() && filteredEquipments.length > 0 && (
        <div className={styles.searchResults}>
          <Equipment 
            equipments={filteredEquipments} 
            loading={loading}
            error={error}
            userType={userType}
            userId={user?.profile?.user?.id}
            onOpenAddForm={onOpenAddForm}
            onOpenBookingForm={onOpenBookingForm}
            isAuthenticated={!!user}
          />
        </div>
      )}
        </>
    );
};

export default Header;
