import type { DoctorAvailabilityRepository } from "../infrastructure/doctor-availability.repository";

export class IsSlotValidUseCase {
  constructor(private readonly repository: DoctorAvailabilityRepository) {}

  async execute(doctorUserId: string, requestedAt: Date): Promise<boolean> {
    const slots = await this.repository.findActiveSlotsForDoctor(doctorUserId);

    if (slots.length === 0) {
      return false;
    }

    const weekday = requestedAt.getUTCDay();
    const minuteOfDay = requestedAt.getUTCHours() * 60 + requestedAt.getUTCMinutes();

    const matchingSlot = slots.find(
      (slot) =>
        slot.weekday === weekday &&
        minuteOfDay >= slot.startMinute &&
        minuteOfDay < slot.endMinute
    );

    return !!matchingSlot;
  }
}
