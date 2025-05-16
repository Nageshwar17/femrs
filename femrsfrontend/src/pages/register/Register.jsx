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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg"];

    // Validation function
    const validateField = (name, value) => {
        switch (name) {
            case "email":
                setErrors((prev) => ({
                    ...prev,
                    email: emailRegex.test(value) ? "" : "Invalid email format."
                }));
                break;
            case "phone_number":
                setErrors((prev) => ({
                    ...prev,
                    phone_number: phoneRegex.test(value)
                        ? ""
                        : "Invalid phone number."
                }));
                break;
            case "pan_number":
                setErrors((prev) => ({
                    ...prev,
                    pan_number: panRegex.test(value)
                        ? ""
                        : "Invalid PAN number format."
                }));
                break;
            case "aadhaar_number":
                setErrors((prev) => ({
                    ...prev,
                    aadhaar_number: aadhaarRegex.test(value)
                        ? ""
                        : "Aadhaar must be 12 digits."
                }));
                break;
            case "password2":
                setErrors((prev) => ({
                    ...prev,
                    password2: formData.password1 === value
                        ? ""
                        : "Passwords do not match."
                }));
                break;
            case "aadhaar_document":
                const fileName = value.name.toLowerCase();
                const isValidFile = allowedFileTypes.some((type) =>
                    fileName.endsWith(type)
                );
                setErrors((prev) => ({
                    ...prev,
                    aadhaar_document: isValidFile
                        ? ""
                        : "Allowed formats: PDF, DOC, DOCX, JPG, JPEG"
                }));
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

        if (files) {
            validateField(name, files[0]);
        } else {
            validateField(name, value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                submit: err.response?.data?.error || "Registration failed. Please try again."
            }));
        }
    };

    return (
        <div className={styles.container}>
            <h2>Create an Account</h2>
            {errors.submit && <p className={styles.error}>{errors.submit}</p>}
            <form onSubmit={handleSubmit}>
                {Object.keys(formData).map((key) => (
                    key !== "aadhaar_document" && key !== "user_type" ? (
                        <div key={key}>
                            <input
                                type={key.includes("password") ? (showPassword ? "text" : "password") : "text"}
                                className={styles.customInput}
                                name={key}
                                placeholder={key.replace("_", " ").toUpperCase()}
                                value={formData[key]}
                                onChange={handleChange}
                                required
                            />
                            {errors[key] && <p className={styles.error}>{errors[key]}</p>}
                        </div>
                    ) : null
                ))}

                <label>
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                    /> Show Password
                </label>

                <label>Upload Aadhaar Document (PDF/DOC/JPG)</label>
                <input
                    type="file"
                    className={styles.customInput}
                    name="aadhaar_document"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg"
                    onChange={handleChange}
                    required
                />
                {errors.aadhaar_document && (
                    <p className={styles.error}>{errors.aadhaar_document}</p>
                )}

                <select name="user_type" value={formData.user_type} onChange={handleChange}>
                    <option value="farmer">Farmer</option>
                    <option value="owner">Owner</option>
                </select>

                <button type="submit">Sign Up</button>
                <p className={styles.pLink} onClick={() => navigate("/login")}>
                    Already have an account? Login
                </p>
            </form>
        </div>
    );
};

export default Register;
