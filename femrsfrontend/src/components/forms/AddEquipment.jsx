import React, { useState } from "react";
import axios from "axios";
import styles from "./addEquipment.module.css";

const AddEquipmentForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        equipment_name: "",
        description: "",
        address: "",
        pin_code: "",
        state: "",
        district: "",
        sub_district: "",
        price_per_day: "",
        available: true,
        image1: null,
        image2: null,
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        Object.keys(formData).forEach((key) => {
            form.append(key, formData[key]);
        });

        try {
            await axios.post("https://femrs.onrender.com/api/equipment/", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            alert("Equipment added successfully!");
            onClose();
            window.location.reload(); // Refresh the page after successful submission
        } catch (error) {
            console.error("Error adding equipment:", error);
            alert("Failed to add equipment.");
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.formContainer}>
                <h2>Add Equipment</h2>
                <form onSubmit={handleSubmit} className={styles.equipmentForm}>
                    <input
                        type="text"
                        name="equipment_name"
                        placeholder="Equipment Name"
                        value={formData.equipment_name}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="pin_code"
                        placeholder="Pin Code"
                        value={formData.pin_code}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="district"
                        placeholder="District"
                        value={formData.district}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="sub_district"
                        placeholder="Sub-District"
                        value={formData.sub_district}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        name="price_per_day"
                        placeholder="Price Per Day"
                        value={formData.price_per_day}
                        onChange={handleChange}
                        required
                    />
                    <label className={styles.customLabel}>
                        <input
                            type="checkbox"
                            name="available"
                            checked={formData.available}
                            onChange={handleChange}
                        />
                        Available
                    </label>
                    <label className={styles.customLabel}> Add Equipment Images</label>
                    <input
                        type="file"
                        name="image1"
                        onChange={handleChange}
                        accept="image/*"
                        required
                    />
                    <input
                        type="file"
                        name="image2"
                        onChange={handleChange}
                        accept="image/*"
                    />
                    <button type="submit" className={styles.submitBtn}>Add Equipment</button>
                    <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default AddEquipmentForm;
