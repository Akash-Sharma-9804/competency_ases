import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import { FileText, UserCircle2,Mail, Building2} from "lucide-react";
import { UserCircle2, FileText, Building2, Mail, Calendar, User } from "lucide-react";

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCandidate(data);
        else console.error("API error:", data.message);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!candidate) return <p className="text-center text-gray-500 mt-10">Loading profile...</p>;

   return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end gap-8">
              {/* Profile Image */}
              <div className="relative group">
                {candidate.photo_path ? (
                  <div className="relative">
                    <img
                      src={candidate.photo_path}
                      alt="Candidate"
                      className="w-40 h-40 rounded-2xl object-cover shadow-2xl border-4 border-white/30 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <UserCircle2 className="w-24 h-24 text-white/60" />
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div className="text-center lg:text-left text-white flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2 tracking-tight">
                  {candidate.name}
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start justify-center lg:justify-start">
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{candidate.email}</span>
                  </div>
                  {candidate.company && (
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm font-medium">{candidate.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Bio Section */}
            {candidate.bio && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  About
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  {candidate.bio}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-800">Age</span>
                </div>
                <p className="text-slate-600 text-lg">{candidate.age || "Not specified"}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-slate-800">Gender</span>
                </div>
                <p className="text-slate-600 text-lg">{candidate.gender || "Not specified"}</p>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                Resume
              </h3>
              
              {candidate.resumeUrl ? (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">View Resume</span>
                  <div className="w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300"></div>
                </a>
              ) : (
                <div className="flex items-center gap-3 text-slate-500 bg-slate-200 px-6 py-4 rounded-2xl">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">No resume uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
