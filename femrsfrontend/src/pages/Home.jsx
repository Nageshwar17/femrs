import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Carousel from "../components/carousel/Carousel";
import AddEquipment from "../components/forms/AddEquipment";
import Equipment from "../components/equipment/Equipment";
import Chatbot from "../components/chatbot/Chatbot";
import BookingForm from "../components/bookingForm/BookingForm";

export default function Home({ user, setUser }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const refreshToken = localStorage.getItem("refresh_token"); 

    const openForm = () => setShowAddForm(true);
    const closeForm = () => setShowAddForm(false);
    const openBookingForm = () => setShowBookingForm(true);
    const closeBookingForm = () => setShowBookingForm(false);

    // Fetch equipment data once when the component mounts
    useEffect(() => {
        const fetchEquipments = async () => {
            try {
                const response = await fetch("https://femrs.onrender.com/api/equipment/");
                if (!response.ok) throw new Error("Failed to fetch equipment.");
                const data = await response.json();
                setEquipments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipments();
    }, []);

    return (
        <>
            {/* Pass refreshToken and navigate function to Header */}
            <Header 
                user={user} 
                setUser={setUser} 
                equipments={equipments}
                loading={loading}
                error={error}
                userType={user?.profile?.user_type || "guest"}
                refreshToken={refreshToken} 
                userId={user?.profile?.user?.id}
                onOpenAddForm={openForm}
                onOpenBookingForm={openBookingForm}
                isAuthenticated={!!user}
            />

            <Carousel />
            <Equipment 
                userType={user?.profile?.user_type || "guest"}
                isAuthenticated={!!user}
                equipments={equipments}
                loading={loading}
                error={error}
                userId={user?.profile?.user?.id}
                onOpenAddForm={openForm}
                onOpenBookingForm={openBookingForm}
            />
            <Chatbot />
           {/* <h4>Welcome,{user ? user.profile.user.id : "000"}, {user ? user.profile.user.username : "Guest"}!</h4>*/}
            <Footer/>
            {showAddForm && <AddEquipment onClose={closeForm} />}
            {showBookingForm && <BookingForm userToken={user?.token} isOpen={showBookingForm} onClose={closeBookingForm} />}
        </>
    );
}
