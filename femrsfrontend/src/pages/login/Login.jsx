// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https:femrs.onrender.com/api/token/", formData);
            
            // ✅ 1. Check if we get the token:
            console.log("Access Token:", response.data.access);
            console.log("Refresh Token:", response.data.refresh);
            
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);
    
            // ✅ 2. Check if we can fetch user profile:
            const profileRes = await axios.get("https://femrs.onrender.com/api/profile/", {
                headers: { Authorization: `Bearer ${response.data.access}` },
            });
            console.log("User Profile Data:", profileRes.data);
    
            // ✅ 3. Update user and navigate:
            setUser(profileRes.data);
            navigate("/home");
        } catch (err) {
            console.error("Error during login:", err);
            setError("Invalid username or password");
        }
    };
    

    useEffect(() => {
        if (localStorage.getItem("access_token")) {
            navigate("/home");
        }
    }, [navigate]);
    


    return (
        <div className={styles.container}>
            <h2>Login</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
                <p onClick={() => navigate("/register")}>
                    Don't have an account? Register
                </p>
            </form>
        </div>
    );
};

export default Login;
