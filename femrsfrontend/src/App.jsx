import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";

function App() {
    const [user, setUser] = useState(null);

    // Helper function to refresh the access token
    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) throw new Error("No refresh token available");

            const response = await axios.post("http://localhost:8000/api/token/refresh/", {
                refresh: refreshToken,
            });

            localStorage.setItem("access_token", response.data.access);
            console.log("🔐 Refreshed Access Token:", response.data.access); // <- Add this line
            return response.data.access;
        } catch (err) {
            console.error("Failed to refresh token", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
            return null;
        }
    };

    // Fetch the authenticated user's profile
    const fetchUser = async () => {
        let token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await axios.get("http://localhost:8000/api/profile/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log("Access token expired. Trying to refresh...");
                token = await refreshAccessToken(); // Try to refresh the token
                if (token) {
                    fetchUser(); // Retry fetching the user
                }
            } else {
                console.error("User not authenticated", err);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setUser(null);
            }
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={<Home user={user} setUser={setUser} />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
