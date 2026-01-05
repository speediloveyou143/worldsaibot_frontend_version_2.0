import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import APIService from "../../services/api";
import { setUser, clearUser } from "../../redux/userSlice";

function ProfileSettings() {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({
        name: user?.name || "",
        contact: user?.contact || "",
        university: user?.university || "",
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await APIService.profile.updateProfile(formData);

            if (response.data) {
                // Backend returns user object directly
                dispatch(setUser(response.data));
                setMessage({ type: "success", text: "Profile updated successfully!" });
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.error || "Failed to update profile"
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== "im sure i wanna delete my account") {
            setMessage({
                type: "error",
                text: "Please type the confirmation text exactly as shown"
            });
            return;
        }

        setLoading(true);
        try {
            await APIService.profile.deleteAccount();

            // Clear user data and redirect
            dispatch(clearUser());
            localStorage.removeItem("token");
            navigate("/");
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.error || "Failed to delete account"
            });
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 md:px-6 md:py-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                    <p className="text-slate-400">Manage your account information and preferences</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === "success"
                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                        }`}>
                        <div className="flex items-center gap-2">
                            <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                            <p>{message.text}</p>
                        </div>
                    </div>
                )}

                {/* Profile Edit Form */}
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <i className="bi bi-person-circle"></i>
                        Personal Information
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Enter your mobile number"
                                required
                            />
                        </div>

                        {/* University */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                University / College
                            </label>
                            <input
                                type="text"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Enter your university or college name"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email || ""}
                                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                                disabled
                            />
                            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <i className="bi bi-arrow-repeat animate-spin"></i>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle"></i>
                                    Update Profile
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30 p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <i className="bi bi-exclamation-triangle-fill text-red-500 text-2xl"></i>
                        <div>
                            <h2 className="text-xl font-bold text-red-500 mb-1">Danger Zone</h2>
                            <p className="text-slate-300 text-sm">
                                Permanently delete your account and all associated data
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                        <h3 className="text-white font-medium mb-2">Before you delete:</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li className="flex items-start gap-2">
                                <i className="bi bi-x-circle text-red-400 mt-0.5"></i>
                                All your courses and progress will be lost
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="bi bi-x-circle text-red-400 mt-0.5"></i>
                                Your certificates will no longer be accessible
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="bi bi-x-circle text-red-400 mt-0.5"></i>
                                This action cannot be undone
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <i className="bi bi-info-circle text-blue-400"></i>
                        <p className="text-slate-300">
                            Please read our{" "}
                            <a
                                href="/privacy-policy"
                                target="_blank"
                                className="text-blue-400 hover:text-blue-300 underline"
                            >
                                Privacy Policy
                            </a>{" "}
                            to delete your account
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="bi bi-trash3"></i>
                        Delete My Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="bi bi-exclamation-triangle-fill text-red-500 text-3xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Delete Account?</h3>
                            <p className="text-slate-400">
                                This action is permanent and cannot be undone
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Type the following to confirm:
                            </label>
                            <p className="text-purple-400 font-mono text-sm mb-3 bg-slate-900/50 p-3 rounded border border-slate-700">
                                im sure i wanna delete my account
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                placeholder="Type here to confirm..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation("");
                                }}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading || deleteConfirmation !== "im sure i wanna delete my account"}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <i className="bi bi-arrow-repeat animate-spin"></i>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-trash3"></i>
                                        Delete Forever
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileSettings;
