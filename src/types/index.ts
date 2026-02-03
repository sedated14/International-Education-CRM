export type LeadType = 'Student' | 'Agent';

export interface StudentProfile {
  age: number;
  dob: string; // YYYY-MM-DD
  gender: string;
  nationality?: string;    // NEW
  residence?: string;      // NEW: Country of Residence
  phoneNumber?: string;    // NEW
  whatsappNumber?: string; // NEW
  email?: string;          // NEW: Student Email
  currentSchool?: string;
  currentGrade?: string;
  gradeApplyingTo?: string;
  seekingGraduation?: boolean; // NEW: For 12th grade applicants
  graduatedInHomeCountry?: boolean; // NEW: For 12th grade current students
  duration?: 'Short Term' | 'Semester (Aug)' | 'Semester (Jan)' | 'Academic Year' | 'Calendar Year';
  gpa?: string;
  desiredSchool?: string;
  desiredDestination: ('USA' | 'Canada' | 'Online')[];
  targetGrades?: {
    USA?: string;
    Canada?: string;
    Online?: string;
  };
  allergies?: string[];
  medicalInfo?: string;
  dietaryRestrictions?: string[];
  hobbies?: string[];
  sports?: string[];
  favoriteSubject?: string;
  personality?: string;
  englishLevel: 'Low' | 'Intermediate' | 'Advanced';
  budget?: string;
  essay?: string;
  preferredCommunication?: ('Email' | 'Phone' | 'Text')[]; // Changed to array
  otherInfo?: string;
  agencyId?: string | number; // NEW: Link to Agency Lead ID
}

export interface Lead {
  id: string | number;
  title: string;
  type: LeadType;
  source: 'Manual' | 'Gmail' | 'CSV' | 'Form';
  createdAt: string; // ISO String for precise sorting
  lastContacted?: string; // ISO String
  followUpDate?: string; // ISO String
  studentName: string;
  country: string;
  status: 'Inquiry' | 'Contacted' | 'Qualified' | 'Lost';
  timestamp: string; // Keep for fallback display or relative time
  score: number;
  // Specific to Student Leads
  studentProfile?: StudentProfile;
  // Metadata for Agents
  agentName?: string;
  commission?: boolean;
  agencyProfile?: Agency; // Store full agency details here

  // Notes System
  notes?: Note[];
}

export interface Note {
  id: string;
  content: string;
  timestamp: string; // ISO String
  author?: string;
}

export interface AgencyContact {
  name: string;
  firstName?: string; // NEW
  lastName?: string;  // NEW
  nickname?: string;  // NEW
  role: string;
  email: string;
  phone: string;
  whatsapp?: string; // NEW
  skype?: string;    // NEW
  preferredCommunication?: string; // NEW
  notes?: string;    // NEW
}

export interface Agency {
  id: number;
  name: string;
  region: string; // NEW
  type: string;
  country: string;
  city: string;
  address?: string; // NEW
  website?: string;

  // Partnership Details
  partnershipStatus: 'Active' | 'Pending' | 'Inactive' | 'Prospective' | 'Do Not Contact';
  contractSignedDate?: string; // ISO
  commissionRate?: string; // e.g. "15%"
  historicalSends: number;
  metAt?: string; // NEW

  // Logistics
  timezone: string;
  language: string;

  // Contacts
  keyContacts: AgencyContact[];
  secondaryContact?: AgencyContact; // NEW

  // Notes
  culturalNotes?: string;
  generalNotes?: string;

  // Profile Details
  gradesOffered?: string[]; // e.g. ["Elementary", "High School"]
  duration?: string[]; // e.g. ["Short Term", "Academic Year"]
  targetCountries?: string[]; // e.g. ["USA", "Canada"]
  recruitingCountries?: string[]; // NEW: Countries recruited from

  createdAt?: string; // NEW: ISO Date Added
  lastContactDate: string; // ISO
}
