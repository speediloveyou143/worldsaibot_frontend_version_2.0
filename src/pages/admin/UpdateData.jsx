import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function UpdateData() {
  const { id } = useParams();
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

  useEffect(() => {
    async function fetchContact() {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-contact/${id}`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          const { _id, __v, ...filteredData } = response.data;
          setFormData(filteredData);
        }
      } catch (err) {
        showAlert("Failed to load contact data.", "error");
      }
    }
    fetchContact();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = [];
    const requiredFields = [
      "offer",
      "heading",
      "tag",
      "insta",
      "linkedin",
      "youtube",
      "channel",
      "maps",
      "group",
      "email",
      "number",
      "address",
      "logo",
    ];
    const fieldLabels = {
      offer: "Offer",
      heading: "Heading",
      tag: "Tag",
      insta: "Instagram URL",
      linkedin: "LinkedIn URL",
      youtube: "YouTube URL",
      channel: "Channel",
      maps: "Google Maps URL",
      group: "Group URL",
      email: "Email",
      number: "Phone Number",
      address: "Address",
      logo: "Logo URL",
    };

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        errors.push(`${fieldLabels[field]} is required.`);
      }
    });

    if (formData.number && !/^\d{10}$/.test(formData.number)) {
      errors.push("Phone number must contain exactly 10 digits.");
    }

    if (errors.length > 0) {
      showAlert(errors.join(", "), "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const updatedContact = { ...formData };
      const response = await axios.put(
        `${BACKEND_URL}/update-contact/${id}`,
        updatedContact,
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Updated successfully!", "success");
      } else {
        showAlert("Contact not updated.", "error");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Something went wrong.", "error");
    }
  };

  return (
    <div className="h-full bg-gray-950 items-start pb-[120px] sm:pb-0 overflow-y-auto bg-gray-950 p-4 flex flex-col">
      <div className="w-full sm:w-2/3 bg-base-300 p-2 sm:p-7 rounded-2xl border-2 border-sky-500 s-form text-center">
        <h1 className="text-4xl">Update Data</h1>
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
        <button onClick={handleSubmit} className="btn w-full mt-3 btn-info">
          Update Data
        </button>

        {alert && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${
              alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
      </div>
    </div>
  );
}

export default UpdateData;