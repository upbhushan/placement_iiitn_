import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profile API
export const fetchStudentProfile = async () => {
  const response = await apiClient.get('/student/profile');
  return response.data;
};

export interface SocialMedia {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface Education {
  tenthMarks?: number;
  twelfthMarks?: number;
}

export interface StudentProfileData {
  name?: string;
  email?: string;
  rollNumber?: string;
  department?: string;
  semester?: number;
  profilePicture?: string;
  
  // New fields
  hometown?: string;
  dob?: Date | string;
  photo?: string;
  socialMedia?: SocialMedia;
  education?: Education;
  
  // Additional fields from your student model
  phoneNumber?: string;
  gender?: string;
  branch?: string;
  cgpa?: number;
  activeBacklogs?: number;
  
  // Placement related fields
  placement?: {
    placed?: boolean;
    company?: string;
    package?: number;
    type?: string; // full-time, intern, etc.
    offerDate?: Date | string;
  };
}

export const updateStudentProfile = async (profileData: StudentProfileData): Promise<StudentProfileData> => {
    const response = await apiClient.put('/student/profile', profileData);
    return response.data;
};

// Cloudinary file upload
export interface CloudinaryUploadResponse {
    url: string;
    public_id: string;
    secure_url?: string;
    format?: string;
    width?: number;
    height?: number;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<CloudinaryUploadResponse>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

export default apiClient;