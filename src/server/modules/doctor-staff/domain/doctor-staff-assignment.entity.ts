export type DoctorStaffAssignment = {
  id: string;
  doctorUserId: string;
  staffUserId: string;
  isActive: boolean;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
