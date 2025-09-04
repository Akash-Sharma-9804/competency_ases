import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { userAPI } from "../../utils/api";
import { FileText } from "lucide-react";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [resumeProgress, setResumeProgress] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userAPI.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error(err.message || "Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await userAPI.updateProfile({
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        age: profile.age,
        bio: profile.bio,
        // company: profile.company,
      });
      setProfile(updatedProfile);
      setEditMode(false);
      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed", err);
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleResumeUpload = async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    setUploadingResume(true);
    setResumeProgress(0);

    try {
      const res = await userAPI.uploadResume(formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setResumeProgress(percent);
        },
      });
      setProfile((prev) => ({ ...prev, resumeUrl: res.url }));
      toast.success("✅ Resume uploaded!");
    } catch (err) {
      console.error("Resume upload failed", err);
      toast.error(err.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
      setTimeout(() => setResumeProgress(0), 500);
    }
  };

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    setUploadingPhoto(true);
    setPhotoProgress(0);

    try {
      const res = await userAPI.uploadPhoto(formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setPhotoProgress(percent);
        },
      });
      setProfile((prev) => ({ ...prev, photo_path: res.url }));
      toast.success("✅ Photo uploaded!");
    } catch (err) {
      console.error("Photo upload failed", err);
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setPhotoProgress(0), 500);
    }
  };
const Spinner = () => (
  <div className="flex justify-center mt-2">
    <svg
      className="animate-spin h-6 w-6 text-indigo-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
);

  if (!profile) return <div className="text-center p-6">Loading...</div>;

return (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto my-12 font-sans transition-all duration-300">
    {!editMode ? (
      <>
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-shrink-0 mx-auto sm:mx-0 relative group">
            <img
              src={
                profile.photo_path ||
                "https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff&size=128"
              }
              alt="Profile"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-sky-400 object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-full bg-sky-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
              Your Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm sm:text-base">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Name:</span> 
                <span className="truncate">{profile.name}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Email:</span> 
                <span className="truncate">{profile.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Company:</span> 
                <span className="truncate">{profile.company?.name || profile.company || "N/A"}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Age:</span> 
                {profile.age || "—"}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Gender:</span> 
                {profile.gender || "—"}
              </p>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="mt-6 px-6 py-2.5 cursor-pointer bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-full hover:from-sky-600 hover:to-indigo-600 font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">About Me</h4>
          <p className="text-gray-600 bg-white p-4 sm:p-6 rounded-xl shadow-sm text-sm sm:text-base leading-relaxed border border-gray-100">
            {profile.bio || "No description provided."}
          </p>
        </div>

        {/* Resume */}
        {profile.resumeUrl && (
          <div className="mt-8">
            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Resume</h4>
            <div
              onClick={() => setShowResume((prev) => !prev)}
              className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-sm sm:text-base border border-gray-100 shadow-sm hover:shadow-md"
            >
              <FileText className="text-sky-500 w-5 h-5" />
              <span className="text-sky-600 font-medium truncate">
                {decodeURIComponent(profile.resumeUrl.split("/").pop())}
              </span>
              <span className="ml-auto text-xs text-gray-500 font-medium">
                {showResume ? "Hide ▲" : "View ▼"}
              </span>
            </div>
            {showResume && (
              <div className="mt-4">
                <iframe
                  src={profile.resumeUrl}
                  title="Resume"
                  className="w-full h-[400px] sm:h-[600px] rounded-xl border border-gray-100 shadow-sm"
                />
              </div>
            )}
          </div>
        )}
      </>
    ) : (
      <>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
          Edit Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={profile.name || ""}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-white shadow-sm"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-white shadow-sm"
              placeholder="Enter your email"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              name="age"
              type="number"
              value={profile.age || ""}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-white shadow-sm"
              placeholder="Enter your age"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={profile.gender || ""}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-white shadow-sm"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Upload Resume */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleResumeUpload(e.target.files[0])}
              disabled={uploadingResume}
              className="block w-full text-sm text-gray-500 file:border file:border-gray-200 file:px-4 file:py-2 file:bg-white file:rounded-xl file:cursor-pointer file:transition-all file:hover:bg-gray-50"
            />
            {uploadingResume && <Spinner />}
          </div>

          {/* Upload Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files[0])}
              disabled={uploadingPhoto}
              className="block w-full text-sm text-gray-500 file:border file:border-gray-200 file:px-4 file:py-2 file:bg-white file:rounded-xl file:cursor-pointer file:transition-all file:hover:bg-gray-50"
            />
            {uploadingPhoto && <Spinner />}
          </div>

          {/* Profile Photo Preview */}
          {profile.photo_path && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Photo</label>
              <img
                src={profile.photo_path}
                alt="Current"
                className="mt-2 w-24 h-24 rounded-full border-2 border-sky-400 object-cover shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            name="bio"
            value={profile.bio || ""}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-white shadow-sm"
            placeholder="Tell us about yourself"
          />
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={() => setEditMode(false)}
            className="px-6 py-2.5 cursor-pointer bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-200 text-sm shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 cursor-pointer bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-full hover:from-sky-600 hover:to-indigo-600 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
          >
            Save
          </button>
        </div>
      </>
    )}
  </div>
);
};

export default Profile;
