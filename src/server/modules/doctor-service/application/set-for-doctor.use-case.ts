import type { DoctorServiceRepository, CreateServiceInput } from "../infrastructure/doctor-service.repository";

export type SetForDoctorInput = {
  doctorUserId: string;
  services: Array<{
    serviceKey: string;
    serviceLabel: string;
    isActive: boolean;
  }>;
};

export class SetForDoctorUseCase {
  constructor(private readonly repository: DoctorServiceRepository) {}

  async execute(input: SetForDoctorInput): Promise<void> {
    await this.repository.deleteAllForDoctor(input.doctorUserId);

    if (input.services.length > 0) {
      const createInputs: CreateServiceInput[] = input.services.map((service) => ({
        doctorUserId: input.doctorUserId,
        serviceKey: service.serviceKey,
        serviceLabel: service.serviceLabel,
        isActive: service.isActive,
      }));

      await this.repository.createMany(createInputs);
    }
  }
}
