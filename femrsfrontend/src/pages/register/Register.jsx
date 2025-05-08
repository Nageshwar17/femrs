import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./register.module.css";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password1: "",
        password2: "",
        user_type: "farmer",
        pan_number: "",
        aadhaar_number: "",
        pan_document: null,
        aadhaar_document: null,
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate password match
        if (formData.password1 !== formData.password2) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key]);
            });

            await axios.post("http://localhost:8000/api/register/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            navigate("/login");
        } catch (err) {
            setError(
                err.response?.data?.error || "Registration failed. Please try again."
            );
        }
    };

    return (
        <div className={styles.container}>
            <h2>Create an Account</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className={styles.customInput}
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    className={styles.customInput}
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    className={styles.customInput}
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    className={styles.customInput}
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    className={styles.customInput}
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    className={styles.customInput}
                    name="password1"
                    placeholder="Password"
                    value={formData.password1}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    className={styles.customInput}
                    name="password2"
                    placeholder="Confirm Password"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                />
                <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                >
                    <option value="farmer">Farmer</option>
                    <option value="owner">Owner</option>
                </select>
                <input
                    type="text"
                    className={styles.customInput}
                    name="pan_number"
                    placeholder="PAN Number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    className={styles.customInput}
                    name="aadhaar_number"
                    placeholder="Aadhaar Number"
                    value={formData.aadhaar_number}
                    onChange={handleChange}
                    required
                />


                <label>Upload Aadhaar Document (PDF/DOC/JPG)</label>
                <input
                    type="file"
                    className={styles.customInput}
                    name="aadhaar_document"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg"
                    onChange={handleChange}
                    required
                />

                <button type="submit">Sign Up</button>
                <p onClick={() => navigate("/login")}>
                    Already have an account? Login
                </p>
            </form>
        </div>
    );
};

export default Register;
