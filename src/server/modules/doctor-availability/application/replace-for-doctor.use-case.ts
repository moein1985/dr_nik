import type { DoctorAvailabilityRepository, CreateSlotInput } from "../infrastructure/doctor-availability.repository";

export type ReplaceForDoctorInput = {
  doctorUserId: string;
  slots: Array<{
    weekday: number;
    startMinute: number;
    endMinute: number;
    isActive: boolean;
  }>;
};

export class ReplaceForDoctorUseCase {
  constructor(private readonly repository: DoctorAvailabilityRepository) {}

  async execute(input: ReplaceForDoctorInput): Promise<void> {
    await this.repository.deleteAllForDoctor(input.doctorUserId);

    if (input.slots.length > 0) {
      const createInputs: CreateSlotInput[] = input.slots.map((slot) => ({
        doctorUserId: input.doctorUserId,
        weekday: slot.weekday,
        startMinute: slot.startMinute,
        endMinute: slot.endMinute,
        isActive: slot.isActive,
      }));

      await this.repository.createMany(createInputs);
    }
  }
}
