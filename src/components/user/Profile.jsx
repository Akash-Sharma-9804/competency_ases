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
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
      {!editMode ? (
        <>
          {/* Top section */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <div className="flex-shrink-0 self-center mb-4 md:mb-0">
              <img
                src={
                  profile.photo_path ||
                  "https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&size=128"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover shadow"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                👤 Your Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <p>
                  <span className="font-medium">Name:</span> {profile.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {profile.email}
                </p>
                <p>
                  <span className="font-medium">Company:</span>{" "}
                  {profile.company?.name || profile.company || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {profile.age || "—"}
                </p>
                <p>
                  <span className="font-medium">Gender:</span>{" "}
                  {profile.gender || "—"}
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-5 py-3 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700 font-medium transition">
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              📝 About Me
            </h4>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
              {profile.bio || "No description provided."}
            </p>
          </div>
          {profile.resumeUrl && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                📄 Resume
              </h4>
              <div
                onClick={() => setShowResume((prev) => !prev)}
                className="flex items-center cursor-pointer gap-3 bg-gray-100 px-4 py-3 rounded-lg border hover:bg-gray-200 transition">
                <FileText className="text-indigo-600" />
                <span className="text-indigo-700 font-medium underline">
                  {decodeURIComponent(profile.resumeUrl.split("/").pop())}
                </span>
                <span className="ml-auto text-sm text-gray-500">
                  {showResume ? "▲ Hide" : "▼ View"}
                </span>
              </div>

              {showResume && (
                <div className="mt-4">
                  <iframe
                    src={profile.resumeUrl}
                    title="Resume"
                    className="w-full h-[600px] rounded-lg border shadow"
                  />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            ✏️ Edit Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                name="age"
                type="number"
                value={profile.age || ""}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={profile.gender || ""}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Upload Resume */}
            <div className="mt-4 col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Resume
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleResumeUpload(e.target.files[0])}
                disabled={uploadingResume}
                className="mt-1 block w-full text-sm text-gray-500 file:border file:border-gray-300 file:px-3 file:py-1 file:bg-white file:rounded-lg"
              />
             {uploadingResume && <Spinner />}

            </div>

            {/* Upload Photo */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e.target.files[0])}
                disabled={uploadingPhoto}
                className="block w-full text-sm text-gray-500 file:border file:border-gray-300 file:px-3 file:py-1 file:bg-white file:rounded-lg"
              />
            {uploadingPhoto && <Spinner />}


            </div>

            {/* Show Profile Photo Preview */}
            {profile.photo_path && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Photo
                </label>
                <img
                  src={profile.photo_path}
                  alt="Current"
                  className="w-24 h-24 rounded-full border-2 border-indigo-500 object-cover"
                />
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio || ""}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 cursor-pointer text-white rounded-lg hover:bg-green-700">
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
