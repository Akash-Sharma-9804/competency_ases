import React, { useEffect, useState } from "react";
import { companyAPI } from "../../utils/api";

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", about: "", website_url: "", logo_url: "" });

  // Fetch company profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await companyAPI.getProfile();
        setCompany(data);
        setForm({
          name: data.name || "",
          address: data.address || "",
          about: data.about || "",
          website_url: data.website_url || "",
          logo_url: data.logo_url || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = await companyAPI.updateProfile(form);
      setCompany(data.company);
      setEditMode(false);
      alert("✅ Profile updated!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Update failed");
    }
  };

  if (!company) return <p>Loading profile...</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
     {!editMode ? (
  <>
    {/* VIEW MODE */}
    <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
      <img
        src={
          company.logo_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            company.name
          )}&background=4f46e5&color=fff&size=128`
        }
        alt="Logo"
        className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover shadow mb-4 md:mb-0"
      />
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
        <p className="text-gray-600">{company.contact_email}</p>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
          {company.about || "No description yet."}
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Address</h3>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
          {company.address || "Not provided"}
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Website</h3>
        {company.website_url ? (
          <a
            href={company.website_url}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:underline break-all"
          >
            {company.website_url}
          </a>
        ) : (
          <p className="text-gray-500">Not provided</p>
        )}
      </div>
    </div>

    <button
      onClick={() => setEditMode(true)}
      className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition"
    >
      ✏️ Edit Profile
    </button>
  </>
) : (
  /* EDIT MODE */
  <form
    onSubmit={handleUpdate}
    className="bg-gray-50 p-6 rounded-xl shadow-inner space-y-5"
  >
    <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h3>

    {/* Responsive grid */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
        />
      </div>
      <div className="flex flex-col md:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1">About</label>
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          rows={4}
          className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Website URL
        </label>
        <input
          name="website_url"
          value={form.website_url}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Logo URL</label>
        <input
          name="logo_url"
          value={form.logo_url}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
        />
      </div>
    </div>

    <div className="flex flex-wrap gap-4 pt-4">
      <button
        type="submit"
        className="flex-1 md:flex-none px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
      >
        ✅ Save Changes
      </button>
      <button
        type="button"
        onClick={() => setEditMode(false)}
        className="flex-1 md:flex-none px-6 py-3 bg-gray-300 text-gray-800 font-medium rounded-lg shadow hover:bg-gray-400 transition"
      >
        ❌ Cancel
      </button>
    </div>
  </form>
)}

    </div>
  );
};

export default CompanyProfile;
