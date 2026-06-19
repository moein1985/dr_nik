export type DoctorProfile = {
  id: string;
  userId: string;
  aboutMe?: string;
  credentials?: string;
  acceptedInsurances?: string;
  workingHours?: string;
  specialties?: string;
  services?: string;
  branchAddress?: string;
  experience?: string;
  extraNotes?: string;
  aiProfileContext?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertDoctorProfileInput = {
  aboutMe?: string;
  credentials?: string;
  acceptedInsurances?: string;
  workingHours?: string;
  specialties?: string;
  services?: string;
  branchAddress?: string;
  experience?: string;
  extraNotes?: string;
  aiProfileContext?: string;
};
