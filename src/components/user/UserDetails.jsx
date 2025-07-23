import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDetails = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [idDoc, setIdDoc] = useState(null);
  const [photo, setPhoto] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build formData for file upload
    const formData = new FormData();
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("company", company);
    formData.append("jobRole", jobRole);
    formData.append("idDoc", idDoc);
    formData.append("photo", photo);

    // TODO: send to backend /api/users/update-profile
    console.log("Submitting profile setup...");
    navigate("/instructions");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 1 of 5</span>
            <span className="text-sm text-gray-500">Profile Setup</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full w-1/5"></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* ID Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload ID Document
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setIdDoc(e.target.files[0])}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg mt-4"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDetails;
