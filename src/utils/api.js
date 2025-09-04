import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request URL:', config.url);
      console.log('Authorization header set:', config.headers.Authorization ? 'Yes' : 'No');
    } else {
      console.log('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const data = error.response.data;
      if (
        data.expired ||
        data.code === "TOKEN_EXPIRED" ||
        data.code === "INVALID_TOKEN"
      ) {
        toast.error(data.message || "Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Generic API request handler
const handleApiRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "API request failed";
    throw new Error(message);
  }
};

// ==================== AUTH APIs ====================

export const authAPI = {
  // User login
  userLogin: (credentials) =>
    handleApiRequest(() => apiClient.post("/users/login", credentials)),

  // Company login
  companyLogin: (credentials) =>
    handleApiRequest(() => apiClient.post("/companies/login", credentials)),

  // User registration
  userRegister: (userData) =>
    handleApiRequest(() => apiClient.post("/users/register", userData)),

  // Company registration
  companyRegister: (companyData) =>
    handleApiRequest(() => apiClient.post("/companies/register", companyData)),
};

// ==================== USER APIs ====================

export const userAPI = {
  // Get user assigned tests
  getAssignedTests: () =>
    handleApiRequest(() => apiClient.get("/tests/user-assigned")),

  // Get company candidates
  getCompanyCandidates: () =>
    handleApiRequest(() => apiClient.get("/users/company-candidates")),

  // Get user profile
  getProfile: () => handleApiRequest(() => apiClient.get("/users/profile")),

  // Update user profile
  updateProfile: (profileData) =>
    handleApiRequest(() => apiClient.put("/users/profile", profileData)),

  // Upload user resume
  uploadResume: (formData) =>
    handleApiRequest(() =>
      apiClient.post("/users/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ),
    // Upload user photo
uploadPhoto: (formData) =>
  handleApiRequest(() =>
    apiClient.post('/users/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  ),

};

// ==================== COMPANY APIs ====================

export const companyAPI = {
  // Get company stats
  getStats: () => handleApiRequest(() => apiClient.get("/companies/stats")),

  // Get company profile
  getProfile: () => handleApiRequest(() => apiClient.get("/companies/profile")),

  // Update company profile
  updateProfile: (profileData) =>
    handleApiRequest(() => apiClient.put("/companies/profile", profileData)),
};

// ==================== TEST APIs ====================

export const testAPI = {
  // Get all tests
  getTests: () => handleApiRequest(() => apiClient.get("/tests")),

  startTest: (data) =>
  handleApiRequest(() => apiClient.post("/tests/start-test", data)),

  // Get single test
  getTest: (testId) =>
    handleApiRequest(() => apiClient.get(`/tests/${testId}`)),

  // Get full test data (for started test, for users)
getStartedTestData: (testId) =>
  handleApiRequest(() => apiClient.get(`/tests/${testId}/start-data`)),

  // Create test
  createTest: (testData) =>
    handleApiRequest(() => apiClient.post("/tests", testData)),

  // Update test
  updateTest: (testId, testData) =>
    handleApiRequest(() => apiClient.put(`/tests/${testId}`, testData)),

  // Delete test
  deleteTest: (testId) =>
    handleApiRequest(() => apiClient.delete(`/tests/${testId}`)),

  // Generate AI questions
  generateAIQuestions: (questionData) =>
    handleApiRequest(() => apiClient.post("/tests/generate-ai", questionData)),

  // Assign test to candidates
  assignTest: (testId, candidateIds) =>
    handleApiRequest(() =>
      apiClient.post(`/tests/${testId}/assign`, { candidateIds })
    ),

  // Update test schedule
  updateSchedule: (testId, scheduleData) =>
    handleApiRequest(() =>
      apiClient.put(`/tests/${testId}/schedule`, scheduleData)
    ),

  // Get user assigned tests (alias for userAPI.getAssignedTests for consistency)
  getUserAssignedTests: () =>
    handleApiRequest(() => apiClient.get("/tests/user-assigned")),
};

// ==================== FILE APIs ====================

export const fileAPI = {
  // Upload files
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return handleApiRequest(() =>
      apiClient.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
  },
};

// ==================== LEGACY CRUD METHODS (for backward compatibility) ====================

export const api = {
  get: (endpoint, options = {}) =>
    handleApiRequest(() => apiClient.get(endpoint, options)),

  post: (endpoint, data, options = {}) => {
    if (data instanceof FormData) {
      return handleApiRequest(() =>
        apiClient.post(endpoint, data, {
          ...options,
          headers: {
            "Content-Type": "multipart/form-data",
            ...options.headers,
          },
        })
      );
    }
    return handleApiRequest(() => apiClient.post(endpoint, data, options));
  },

  put: (endpoint, data, options = {}) => {
    if (data instanceof FormData) {
      return handleApiRequest(() =>
        apiClient.put(endpoint, data, {
          ...options,
          headers: {
            "Content-Type": "multipart/form-data",
            ...options.headers,
          },
        })
      );
    }
    return handleApiRequest(() => apiClient.put(endpoint, data, options));
  },

  delete: (endpoint, options = {}) =>
    handleApiRequest(() => apiClient.delete(endpoint, options)),
};

export default api;
