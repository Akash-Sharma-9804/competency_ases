import React, { useEffect, useState } from "react";
import { userAPI, testAPI } from "../../utils/api";
import { setTestData } from "../../store/testSlice";
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  BookOpen, 
  Award,
  Timer,
  Play,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  Activity,
  BarChart3,
  Flame,
  ChevronRight,
  Bell,
  Coffee,
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../common/animations.css";
const UserHome = () => {
  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
const navigate = useNavigate();
  // Mock user stats - replace with backend data later
  const [userStats] = useState({
    testsCompleted: 12,
    averageScore: 87,
    streak: 7,
    rank: 23,
    totalHours: 45,
    achievements: 8,
    level: 5,
    xp: 2450
  });

  const [quickStats] = useState([
    { label: "Tests This Week", value: 3, icon: Calendar, color: "blue" },
    { label: "Average Score", value: "87%", icon: Target, color: "green" },
    { label: "Current Streak", value: "7 days", icon: Flame, color: "orange" },
    { label: "Global Rank", value: "#23", icon: Trophy, color: "purple" }
  ]);

  // Mock recent activities - replace with backend data
  const [recentActivities] = useState([
    { action: "Completed JavaScript Test", time: "2 hours ago", icon: CheckCircle, color: "green" },
    { action: "Earned Speed Demon Badge", time: "1 day ago", icon: Award, color: "purple" },
    { action: "Started React Basics", time: "2 days ago", icon: Play, color: "blue" }
  ]);

  const handleStartTest = async (test_id, user_id) => {
    try {
      const response = await testAPI.startTest({ test_id });
      // dispatch(setTestData({ testId: test_id, userId: user_id }));
      localStorage.setItem("testId", test_id);
      localStorage.setItem("userId", user_id);
      navigate("/instructions");
      console.log("Navigating to instructions...");
    } catch (error) {
      console.error("Start test failed:", error);
      // toast.error(error.message || "Unable to start test.");
    }
  };

  const fetchAssignedTests = async () => {
    try {
      const data = await userAPI.getAssignedTests();
      console.log("assigned test", data);
      setAssignedTests(data);
    } catch (err) {
      console.error(err);
      // toast.error(err.message || "Failed to load assigned tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTests();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update greeting based on time
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
    if (now > end) return "Test window ended";

    const diff = start - now;
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    return `${days > 0 ? days + "d " : ""}${hours > 0 ? hours + "h " : ""}${mins}m left`;
  };

  const getTestUrgency = (startTime) => {
    if (!startTime) return "normal";
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours <= 2) return "critical";
    if (hours <= 24) return "urgent";
    if (hours <= 72) return "soon";
    return "normal";
  };

  const upcomingTests = assignedTests.filter((t) => {
    const now = new Date();
    const startTime = new Date(t.test_master?.scheduled_start);
    const endTime = new Date(t.test_master?.scheduled_end);
    return t.status === "scheduled" && (!endTime || endTime > now);
  });

  const getColorScheme = (color) => {
    const schemes = {
      blue: "from-blue-500 to-blue-600 text-blue-100",
      green: "from-green-500 to-green-600 text-green-100",
      orange: "from-orange-500 to-orange-600 text-orange-100",
      purple: "from-purple-500 to-purple-600 text-purple-100"
    };
    return schemes[color] || schemes.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-32"></div>
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Welcome Header with Animation */}
        <div
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          style={{
            animation: "slideInFromTop 0.8s ease-out"
          }}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-bounce">
                {greeting}! 👋
              </h1>
              <p className="text-white/90 text-lg mb-4">
                Ready to ace your tests today?
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {currentTime.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="text-right">
                <p className="text-2xl font-bold">Level {userStats.level}</p>
                <p className="text-white/90">XP: {userStats.xp.toLocaleString()}</p>
              </div>
              <div className="mt-2 w-32 h-2 bg-white/20 rounded-full">
                <div 
                  className="h-2 bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${(userStats.xp % 1000) / 10}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Floating decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-spin" style={{ animationDuration: "20s" }}></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full" style={{ animation: "spin 25s linear infinite reverse" }}></div>
        </div>

        {/* Quick Stats with Staggered Animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${getColorScheme(stat.color)} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform`}
                style={{
                  animation: `slideInFromBottom 0.6s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px) scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0) scale(1)"}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-80" />
                </div>
              </div>
            );
          })}
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

        {/* Upcoming Tests with Enhanced Animations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="animate-pulse">🎯</span>
              Upcoming Tests
              <span className="text-lg font-normal text-gray-500">
                ({upcomingTests.length})
              </span>
            </h2>
            
            {upcomingTests.length > 0 && (
              <div className="text-sm text-gray-600 flex items-center gap-2 animate-pulse">
                <Bell className="w-4 h-4" />
                {upcomingTests.filter(t => getTestUrgency(t.test_master?.scheduled_start) !== 'normal').length} urgent
              </div>
            )}
          </div>

          {upcomingTests.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="text-8xl mb-4 animate-bounce">📚</div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
              <p className="text-gray-600 mb-4">No upcoming tests assigned at the moment.</p>
              <p className="text-sm text-gray-500">Check back later or contact your administrator for new assignments.</p>
              
              <div className="mt-8 flex justify-center gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                  View All Tests
                </button>
                <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                  Practice Mode
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTests.map((test, index) => {
                const startTime = test.test_master?.scheduled_start;
                const endTime = test.test_master?.scheduled_end;
                const timeLeft = calculateTimeLeft(startTime, endTime);
                const urgency = getTestUrgency(startTime);
                const isLive = timeLeft === null && test.status === "scheduled";
                
                const urgencyConfig = {
                  critical: {
                    border: "border-red-400",
                    bg: "from-red-50 to-red-100",
                    bounce: "animate-bounce",
                    pulse: "animate-pulse"
                  },
                  urgent: {
                    border: "border-orange-400",
                    bg: "from-orange-50 to-orange-100",
                    bounce: "animate-bounce",
                    pulse: "animate-pulse"
                  },
                  soon: {
                    border: "border-yellow-400",
                    bg: "from-yellow-50 to-yellow-100",
                    bounce: "animate-bounce",
                    pulse: ""
                  },
                  normal: {
                    border: "border-gray-200",
                    bg: "from-white to-gray-50",
                    bounce: "",
                    pulse: ""
                  }
                };

                const config = urgencyConfig[urgency];

                return (
                  <div
                    key={test.test_id}
                    className={`relative bg-gradient-to-br ${config.bg} rounded-2xl p-6 shadow-lg border-2 ${config.border} hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:scale-105 ${config.bounce} ${config.pulse}`}
                    style={{
                      animation: `slideInFromBottom 0.8s ease-out ${index * 0.1}s both, ${config.bounce ? 'bounce 2s infinite 2s' : ''}`
                    }}
                  >
                    {/* Pulsing effect for urgent tests */}
                    {config.pulse && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ animation: "shimmer 2s infinite" }}
                      />
                    )}

                    {/* Urgency indicator */}
                    {urgency !== 'normal' && (
                      <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-800 mb-2">
                            {test.test_master?.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/80 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1 hover:scale-105 transition-transform">
                              <Users className="w-3 h-3" />
                              {test.company?.name}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isLive
                              ? "bg-green-500 text-white animate-pulse"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {isLive ? "🔴 LIVE NOW" : test.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {startTime
                              ? new Date(startTime).toLocaleDateString()
                              : "Date TBD"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {startTime
                              ? new Date(startTime).toLocaleTimeString()
                              : "Time TBD"}
                          </span>
                        </div>

                        {timeLeft && timeLeft !== "Test window ended" && (
                          <div className={`flex items-center gap-2 font-semibold text-sm ${
                            urgency === 'critical' ? 'text-red-700' :
                            urgency === 'urgent' ? 'text-orange-700' :
                            urgency === 'soon' ? 'text-yellow-700' :
                            'text-indigo-700'
                          }`}>
                            <Timer className="w-4 h-4" />
                            {timeLeft}
                          </div>
                        )}
                      </div>

                      {(test.status === "scheduled" && 
                        (timeLeft === null || (typeof timeLeft === "string" && timeLeft !== "Test window ended"))) && (
                        <button
                          onClick={() => handleStartTest(test.test_id, test.user_id)}
                          className={`w-full cursor-pointer py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                            isLive 
                              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 animate-pulse" 
                              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                          }`}
                        >
                          <Play className="w-5 h-5" />
                          {isLive ? "Join Live Test" : "Start Test"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Additional Dashboard Sections */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Activity */}
          <div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            style={{ animation: "slideInFromLeft 0.8s ease-out 1.2s both" }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Icon className={`w-5 h-5 ${
                      activity.color === 'green' ? 'text-green-600' :
                      activity.color === 'purple' ? 'text-purple-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            style={{ animation: "slideInFromBottom 0.8s ease-out 1.3s both" }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 hover:scale-[1.02] group">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium text-gray-800">Practice Mode</p>
                    <p className="text-xs text-gray-500">Sharpen your skills</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              <button className="w-full p-3 text-left bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all duration-200 hover:scale-[1.02] group">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium text-gray-800">View Results</p>
                    <p className="text-xs text-gray-500">Check your performance</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              <button className="w-full p-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-200 hover:scale-[1.02] group">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium text-gray-800">Study Materials</p>
                    <p className="text-xs text-gray-500">Prepare for tests</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Achievements & Progress */}
          <div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            style={{ animation: "slideInFromRight 0.8s ease-out 1.4s both" }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{userStats.achievements}</p>
                <p className="text-xs text-gray-600">Unlocked</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{userStats.streak}</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
            </div>
            
            {/* Progress to next level - only show if user has XP */}
            {userStats.xp > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Next Level</span>
                  <span className="text-sm text-gray-600">{userStats.xp % 1000}/1000 XP</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${(userStats.xp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
     
    </div>
  );
};

export default UserHome;