import React, { useState, useEffect } from "react";

const Profile = () => {
  // 🔹 When backend is ready, fetch data here:
  // useEffect(() => {
  //   fetch("/api/profile").then(res=>res.json()).then(data=>setProfile(data));
  // }, []);

  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "TechCorp",
    role: "Software Developer",
    age: 27,
    gender: "Male",
    description:
      "Passionate software developer with 5+ years of experience in building scalable web applications. Always eager to learn and take on challenging problems.",
    resumeUrl: "/uploads/john_doe_resume.pdf",
    photo:
      "https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff&size=128",
  });

  // handlers
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // 🔹 Save to backend with a PUT/POST request
    console.log("Saving profile:", profile);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
      {!editMode ? (
        <>
          {/* Top section */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <div className="flex-shrink-0 self-center mb-4 md:mb-0">
              <img
                src={profile.photo}
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
                  <span className="font-medium">Company:</span> {profile.company}
                </p>
                <p>
                  <span className="font-medium">Role:</span> {profile.role}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {profile.age}
                </p>
                <p>
                  <span className="font-medium">Gender:</span> {profile.gender}
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">📝 About Me</h4>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
              {profile.description}
            </p>
          </div>

          {/* Resume */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">📄 Resume</h4>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 p-4 rounded-lg gap-3">
              <span className="text-gray-700">Your uploaded resume is available.</span>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition text-center"
              >
                View Resume
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode UI */}
          <h3 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["name", "email", "company", "role", "age", "gender"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field}
                </label>
                <input
                  name={field}
                  value={profile[field]}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
          </div>

          {/* Description editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Description
            </label>
            <textarea
              name="description"
              value={profile.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
