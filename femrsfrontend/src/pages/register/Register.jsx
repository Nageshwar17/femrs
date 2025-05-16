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
        aadhaar_document: null,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Regular Expressions
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const aadhaarRegex = /^\d{12}$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const allowedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg"];

    const validateField = (name, value) => {
        switch (name) {
            case "pan_number":
                if (!panRegex.test(value)) {
                    setErrors((prev) => ({ ...prev, pan_number: "Invalid PAN number format." }));
                } else {
                    setErrors((prev) => ({ ...prev, pan_number: "" }));
                }
                break;

            case "aadhaar_number":
                if (!aadhaarRegex.test(value)) {
                    setErrors((prev) => ({ ...prev, aadhaar_number: "Aadhaar must be 12 digits." }));
                } else {
                    setErrors((prev) => ({ ...prev, aadhaar_number: "" }));
                }
                break;

            case "phone_number":
                if (!phoneRegex.test(value)) {
                    setErrors((prev) => ({ ...prev, phone_number: "Invalid phone number." }));
                } else {
                    setErrors((prev) => ({ ...prev, phone_number: "" }));
                }
                break;

            case "password2":
                if (formData.password1 !== value) {
                    setErrors((prev) => ({ ...prev, password2: "Passwords do not match." }));
                } else {
                    setErrors((prev) => ({ ...prev, password2: "" }));
                }
                break;

            case "aadhaar_document":
                const fileName = value.name.toLowerCase();
                const isValidFile = allowedFileTypes.some((type) =>
                    fileName.endsWith(type)
                );
                if (!isValidFile) {
                    setErrors((prev) => ({ ...prev, aadhaar_document: "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, JPEG" }));
                } else {
                    setErrors((prev) => ({ ...prev, aadhaar_document: "" }));
                }
                break;

            default:
                break;
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });

        if (name === "aadhaar_document") {
            validateField(name, files[0]);
        } else {
            validateField(name, value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If any errors are still present, prevent submission
        if (Object.values(errors).some((err) => err !== "")) {
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key]);
            });

            await axios.post("https://femrs.onrender.com/api/register/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            navigate("/login");
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                submit: err.response?.data?.error || "Registration failed. Please try again.",
            }));
        }
    };

    return (
        <div className={styles.container}>
            <h2>Create an Account</h2>
            {errors.submit && <p className={styles.error}>{errors.submit}</p>}
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
                    type="text"
                    className={styles.customInput}
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
                {errors.phone_number && <p className={styles.error}>{errors.phone_number}</p>}

                <div className={styles.passwordContainer}>
                    <input
                        type={showPassword ? "text" : "password"}
                        className={styles.customInput}
                        name="password1"
                        placeholder="Password"
                        value={formData.password1}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type={showPassword ? "text" : "password"}
                        className={styles.customInput}
                        name="password2"
                        placeholder="Confirm Password"
                        value={formData.password2}
                        onChange={handleChange}
                        required
                    />
                    {errors.password2 && <p className={styles.error}>{errors.password2}</p>}
                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        Show Password
                    </label>
                </div>

                <input
                    type="text"
                    className={styles.customInput}
                    name="pan_number"
                    placeholder="PAN Number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    required
                />
                {errors.pan_number && <p className={styles.error}>{errors.pan_number}</p>}

                <input
                    type="text"
                    className={styles.customInput}
                    name="aadhaar_number"
                    placeholder="Aadhaar Number"
                    value={formData.aadhaar_number}
                    onChange={handleChange}
                    required
                />
                {errors.aadhaar_number && <p className={styles.error}>{errors.aadhaar_number}</p>}

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Register;
