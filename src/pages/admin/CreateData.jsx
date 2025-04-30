import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../config/constant";

function CreateData() {
  const [formData, setFormData] = useState({
    offer: "",
    heading: "",
    tag: "",
    insta: "",
    linkedin: "",
    youtube: "",
    channel: "",
    maps: "",
    group: "",
    email: "",
    number: "",
    address: "",
    logo: "",
  });

  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation for number field
    if (name === "number") {
      if (!/^\d{0,10}$/.test(value)) {
        showAlert("Phone number must contain exactly 10 digits.", "error");
      } else if (value.length === 10) {
        showAlert(null, null);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Basic validation for all fields
      const requiredFields = Object.keys(formData);
      const missingFields = requiredFields.filter((field) => !formData[field]);
      if (missingFields.length > 0) {
        showAlert(`Please fill in all fields: ${missingFields.join(", ")}`, "error");
        return;
      }

      // Specific validation for number (10 digits)
      if (!/^\d{10}$/.test(formData.number)) {
        showAlert("Phone number must contain exactly 10 digits.", "error");
        return;
      }

      const contact = { ...formData };
      const response = await axios.post(
        `${BACKEND_URL}/create-contact`,
        contact,
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Data stored successfully", "success");
        setFormData({
          offer: "",
          heading: "",
          tag: "",
          insta: "",
          linkedin: "",
          youtube: "",
          channel: "",
          maps: "",
          group: "",
          email: "",
          number: "",
          address: "",
          logo: "",
        });
      } else {
        showAlert("Contact not created.", "error");
      }
    } catch (err) {
      showAlert("Something went wrong while creating the contact.", "error");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-950 p-4 flex flex-col items-start pb-[60px]">
      {/* Create Contact Form */}
      <div className="sm:w-2/3 w-full bg-base-300 p-2 sm:p-7 rounded-2xl border-2 border-sky-500 s-form text-center mb-8 mx-auto">
        <h1 className="text-4xl">Create Data</h1>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Offer:
          <input
            type="text"
            name="offer"
            value={formData.offer}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Heading:
          <input
            type="text"
            name="heading"
            value={formData.heading}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Tag:
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Instagram URL:
          <input
            type="url"
            name="insta"
            value={formData.insta}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          LinkedIn URL:
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          YouTube URL:
          <input
            type="url"
            name="youtube"
            value={formData.youtube}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Channel:
          <input
            type="text"
            name="channel"
            value={formData.channel}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Google Maps URL:
          <input
            type="url"
            name="maps"
            value={formData.maps}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Group URL:
          <input
            type="url"
            name="group"
            value={formData.group}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Phone Number:
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="grow"
            maxLength="10"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="grow"
          />
        </label>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Logo URL:
          <input
            type="url"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            className="grow"
          />
        </label>

        {alert && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${
              alert.type === "success" ? "bg-green-600" : "bg-red-600"
            } flex flex-col w-80`}
          >
            <div className="flex items-center space-x-2">
              <span className="flex-1">{alert.message}</span>
              <button
                onClick={dismissAlert}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="w-full h-1 mt-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button onClick={handleSubmit} className="btn w-full mt-3 btn-info">
          Create Data
        </button>
      </div>
    </div>
  );
}

export default CreateData;