import React, { useEffect, useState } from "react";
import { userAPI, testAPI } from "../../utils/api";
import { setTestData } from "../../store/testSlice";
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Timer,
  Play,
  CheckCircle,
  Star,
  Users,
  Activity,
  Flame,
  ChevronRight,
  Bell,
  Coffee,
  Brain,
  Video,
  Mic,
  Monitor,
  Briefcase,
  MapPin,
  Award,
  Zap,
  Eye,
  User,
  Shield,
  BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "../common/animations.css";

const UserHome = () => {
  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Simplified user stats for interview context
  const [userStats] = useState({
    completedInterviews: 0,
    upcomingInterviews: 0,
    averageRating: 0,
    totalHours: 0
  });

  const [systemStatus] = useState({
    camera: "ready",
    microphone: "ready", 
    internet: "excellent",
    browser: "compatible"
  });

  const handleStartTest = async (test_id, user_id) => {
    try {
      const response = await testAPI.startTest({ test_id });
      dispatch(setTestData({ testId: test_id, userId: user_id }));
      localStorage.setItem("testId", test_id);
      localStorage.setItem("userId", user_id);
      navigate("/instructions");
    } catch (error) {
      console.error("Start test failed:", error);
    }
  };

  const fetchAssignedTests = async () => {
    try {
      const data = await userAPI.getAssignedTests();
      console.log("assigned test", data);
      setAssignedTests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTests();
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };

    updateGreeting();
    const greetingInterval = setInterval(updateGreeting, 60000);

    // Force rerender every minute for timer updates
    const testInterval = setInterval(() => {
      setAssignedTests((prev) => [...prev]);
    }, 60000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(greetingInterval);
      clearInterval(testInterval);
    };
  }, []);

  const calculateTimeLeft = (startTime, endTime) => {
    if (!startTime) return null;
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now >= start && now <= end) return null;
    if (now > end) return "Interview window ended";

    const diff = start - now;
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    return `${days > 0 ? days + "d " : ""}${hours > 0 ? hours + "h " : ""}${mins}m`;
  };

  const getTestUrgency = (startTime) => {
    if (!startTime) return "normal";
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours <= 1) return "critical";
    if (hours <= 4) return "urgent";
    if (hours <= 24) return "soon";
    return "normal";
  };

  const upcomingTests = assignedTests.filter((t) => {
    const now = new Date();
    const startTime = new Date(t.test_master?.scheduled_start);
    const endTime = new Date(t.test_master?.scheduled_end);
    return t.status === "scheduled" && (!endTime || endTime > now);
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case "ready": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning": return <Bell className="w-4 h-4 text-yellow-500" />;
      case "error": return <Shield className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/50 rounded-2xl h-32 backdrop-blur-sm"></div>
              ))}
            </div>
            <div className="bg-white/50 rounded-3xl h-64 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto p-6 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text  ">
                    {greeting}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg">Ready for your interviews today?</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl">
                  <Calendar className="w-4 h-4" />
                  {currentTime.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl">
                  <Clock className="w-4 h-4" />
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
           
          </div>
        </div>

       {/* Motivation Banner */}
                <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
                style={{ animation: "slideInFromLeft 0.8s ease-out 0.5s both" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl animate-bounce">🚀</div>
                    <div>
                      <h3 className="text-xl font-bold">You're on fire!</h3>
                      <p className="opacity-90">Keep up the great work with your {userStats.streak}-day streak!</p>
                    </div>
                  </div>
                  <Coffee className="w-8 h-8 opacity-80" />
                </div>
              </div>  

        {/* Upcoming Interviews */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-indigo-600" />
              Upcoming Interviews
              {upcomingTests.length > 0 && (
                <span className="text-lg font-normal text-gray-500">
                  ({upcomingTests.length})
                </span>
              )}
            </h2>
            
            {upcomingTests.filter(t => getTestUrgency(t.test_master?.scheduled_start) !== 'normal').length > 0 && (
              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-xl animate-pulse">
                <Bell className="w-4 h-4" />
                <span className="font-medium">
                  {upcomingTests.filter(t => getTestUrgency(t.test_master?.scheduled_start) !== 'normal').length} urgent
                </span>
              </div>
            )}
          </div>

          {upcomingTests.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-16 text-center shadow-lg border border-white/20">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Coffee className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">All Clear!</h3>
                <p className="text-gray-600 text-lg mb-2">No interviews scheduled at the moment</p>
                <p className="text-gray-500">Take this time to prepare or check your system settings</p>
              </div>
              
           
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {upcomingTests.map((test, index) => {
                const startTime = test.test_master?.scheduled_start;
                const endTime = test.test_master?.scheduled_end;
                const timeLeft = calculateTimeLeft(startTime, endTime);
                const urgency = getTestUrgency(startTime);
                const isLive = timeLeft === null && test.status === "scheduled";
                
                const urgencyStyles = {
                  critical: "border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-red-200/50",
                  urgent: "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-200/50",  
                  soon: "border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-200/50",
                  normal: "border-white/30 bg-white/70 shadow-blue-200/30"
                };

                return (
                  <div
                    key={test.test_id}
                    className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden group ${urgencyStyles[urgency]} ${urgency === 'critical' ? 'animate-pulse' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Animated gradient overlay for live interviews */}
                    {isLive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 animate-pulse"></div>
                    )}
                    
                    {/* Urgency indicator */}
                    {urgency === 'critical' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {isLive && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
                            <h3 className="font-bold text-xl text-gray-800">
                              {test.test_master?.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                              <Users className="w-4 h-4" />
                              {test.company?.name}
                            </div>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isLive
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse shadow-lg"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        }`}>
                          {isLive ? "🔴 LIVE" : test.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="font-medium">
                            {startTime ? new Date(startTime).toLocaleDateString([], { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : "Date TBD"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="font-medium">
                            {startTime ? new Date(startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : "Time TBD"}
                          </span>
                        </div>

                        {timeLeft && timeLeft !== "Interview window ended" && (
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              urgency === 'critical' ? 'bg-red-100' :
                              urgency === 'urgent' ? 'bg-orange-100' :
                              urgency === 'soon' ? 'bg-yellow-100' :
                              'bg-indigo-100'
                            }`}>
                              <Timer className="w-4 h-4" />
                            </div>
                            <span className={`font-bold text-sm ${
                              urgency === 'critical' ? 'text-red-700' :
                              urgency === 'urgent' ? 'text-orange-700' :
                              urgency === 'soon' ? 'text-yellow-700' :
                              'text-indigo-700'
                            }`}>
                              Starts in {timeLeft}
                            </span>
                          </div>
                        )}
                      </div>

                      {(test.status === "scheduled" && 
                        (timeLeft === null || (typeof timeLeft === "string" && timeLeft !== "Interview window ended"))) && (
                        <button
                          onClick={() => handleStartTest(test.test_id, test.user_id)}
                          className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${
                            isLive 
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                          }`}
                        >
                          <div className="absolute inset-0 bg-white/20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          <Play className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">
                            {isLive ? "Join Interview" : "Start Interview"}
                          </span>
                          <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHome;