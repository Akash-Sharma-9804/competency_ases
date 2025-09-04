import React, { useEffect, useState } from "react";
import { companyAPI } from "../../utils/api";
import { Building2, Mail, Globe, MapPin, Edit3, Save, X, ExternalLink } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {!editMode ? (
            <>
              {/* VIEW MODE */}
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 sm:px-8 py-8 sm:py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full -translate-y-32 sm:-translate-y-48 translate-x-32 sm:translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/5 rounded-full translate-y-24 sm:translate-y-36 -translate-x-24 sm:-translate-x-36"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
                  {/* Company Logo */}
                  <div className="relative group">
                    <img
                      src={
                        company.logo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          company.name
                        )}&background=4f46e5&color=fff&size=160`
                      }
                      alt="Company Logo"
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-2xl border-4 border-white/30 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Company Info */}
                  <div className="text-center sm:text-left text-white flex-1">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
                      {company.name}
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start justify-center sm:justify-start">
                      <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">{company.contact_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditMode(true)}
                    className="sm:absolute sm:top-6 cursor-pointer sm:right-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="font-medium">Edit Profile</span>
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8">
                {/* About Section */}
                <div className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    About Company
                  </h2>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                    <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
                      {company.about || "No description yet."}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Address */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-slate-800">Address</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {company.address || "Not provided"}
                    </p>
                  </div>

                  {/* Website */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-slate-800">Website</h3>
                    </div>
                    {company.website_url ? (
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium break-all transition-colors duration-200"
                      >
                        <span className="truncate">{company.website_url}</span>
                        <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-slate-500">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* EDIT MODE */
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  Edit Company Profile
                </h2>
                <p className="text-slate-600 mt-2">Update your company information below</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
                {/* Form Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Company Name */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Company Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      name="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={handleChange}
                      className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                      placeholder="contact@company.com"
                    />
                  </div>

                  {/* Website URL */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Website URL
                    </label>
                    <input
                      name="website_url"
                      type="url"
                      value={form.website_url}
                      onChange={handleChange}
                      className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                      placeholder="https://company.com"
                    />
                  </div>

                  {/* Logo URL */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      name="logo_url"
                      type="url"
                      value={form.logo_url}
                      onChange={handleChange}
                      className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                      placeholder="https://company.com/logo.png"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                      placeholder="123 Business Street, City, State 12345"
                    />
                  </div>

                  {/* About */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      About Company
                    </label>
                    <textarea
                      name="about"
                      value={form.about}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="Tell us about your company..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="flex items-center justify-center cursor-pointer gap-2 flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex items-center justify-center cursor-pointer gap-2 flex-1 sm:flex-none px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
