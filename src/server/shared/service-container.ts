import { env } from "@/server/config/env";
import { CancelMyAppointmentUseCase } from "@/server/modules/appointment/application/cancel-my-appointment.use-case";
import { CreateAppointmentUseCase } from "@/server/modules/appointment/application/create-appointment.use-case";
import { DeleteAppointmentByStaffUseCase } from "@/server/modules/appointment/application/delete-appointment-by-staff.use-case";
import { FindAppointmentByIdUseCase } from "@/server/modules/appointment/application/find-appointment-by-id.use-case";
import { ListAppointmentsByDoctorIdsUseCase } from "@/server/modules/appointment/application/list-appointments-by-doctor-ids.use-case";
import { ListAppointmentsUseCase } from "@/server/modules/appointment/application/list-appointments.use-case";
import { ListMyAppointmentsUseCase } from "@/server/modules/appointment/application/list-my-appointments.use-case";
import { UpdateAppointmentByStaffUseCase } from "@/server/modules/appointment/application/update-appointment-by-staff.use-case";
import { UpdateAppointmentStatusUseCase } from "@/server/modules/appointment/application/update-appointment-status.use-case";
import { PrismaAppointmentRepository } from "@/server/modules/appointment/infrastructure/prisma-appointment.repository";
import { CreateAdminUseCase } from "@/server/modules/auth/application/create-admin.use-case";
import { CreateSessionUseCase } from "@/server/modules/auth/application/create-session.use-case";
import { CreateStaffUseCase } from "@/server/modules/auth/application/create-staff.use-case";
import { EnsureDefaultAdminUseCase } from "@/server/modules/auth/application/ensure-default-admin.use-case";
import { EnsureDefaultStaffUseCase } from "@/server/modules/auth/application/ensure-default-staff.use-case";
import { EnsureDefaultSuperAdminUseCase } from "@/server/modules/auth/application/ensure-default-super-admin.use-case";
import { ForgotPasswordUseCase } from "@/server/modules/auth/application/forgot-password.use-case";
import { GetPublicUserUseCase } from "@/server/modules/auth/application/get-public-user.use-case";
import { ListUsersUseCase } from "@/server/modules/auth/application/list-users.use-case";
import { LoginUseCase } from "@/server/modules/auth/application/login.use-case";
import { RegisterPatientUseCase } from "@/server/modules/auth/application/register-patient.use-case";
import { ResolveSessionUseCase } from "@/server/modules/auth/application/resolve-session.use-case";
import { ResetPasswordUseCase } from "@/server/modules/auth/application/reset-password.use-case";
import { RevokeSessionUseCase } from "@/server/modules/auth/application/revoke-session.use-case";
import { SetUserActiveUseCase } from "@/server/modules/auth/application/set-user-active.use-case";
import { SetUserRoleUseCase } from "@/server/modules/auth/application/set-user-role.use-case";
import { GetMyDoctorProfileUseCase } from "@/server/modules/doctor-profile/application/get-my-doctor-profile.use-case";
import { UpsertMyDoctorProfileUseCase } from "@/server/modules/doctor-profile/application/upsert-my-doctor-profile.use-case";
import { PrismaDoctorProfileRepository } from "@/server/modules/doctor-profile/infrastructure/prisma-doctor-profile.repository";
import { AssignStaffToDoctorUseCase } from "@/server/modules/doctor-staff/application/assign-staff-to-doctor.use-case";
import { ListAssignedStaffForDoctorUseCase } from "@/server/modules/doctor-staff/application/list-assigned-staff-for-doctor.use-case";
import { ListAssignableStaffUseCase } from "@/server/modules/doctor-staff/application/list-assignable-staff.use-case";
import { ListDoctorsForStaffUseCase } from "@/server/modules/doctor-staff/application/list-doctors-for-staff.use-case";
import { UnassignStaffFromDoctorUseCase } from "@/server/modules/doctor-staff/application/unassign-staff-from-doctor.use-case";
import { PrismaDoctorStaffAssignmentRepository } from "@/server/modules/doctor-staff/infrastructure/prisma-doctor-staff-assignment.repository";
import { KavenegarSmsSender } from "@/server/modules/auth/infrastructure/kavenegar-sms.sender";
import { MockSmsSender } from "@/server/modules/auth/infrastructure/mock-sms.sender";
import { PrismaPasswordResetRepository } from "@/server/modules/auth/infrastructure/prisma-password-reset.repository";
import { PrismaSessionRepository } from "@/server/modules/auth/infrastructure/prisma-session.repository";
import { PrismaUserRepository } from "@/server/modules/auth/infrastructure/prisma-user.repository";
import { ScryptPasswordHasher } from "@/server/modules/auth/infrastructure/scrypt-password-hasher";
import type { PublicUser } from "@/server/modules/auth/domain/user.entity";
import { NotifyStaffUseCase } from "@/server/modules/staff-email/application/notify-staff.use-case";
import { SmtpEmailSender } from "@/server/modules/staff-email/infrastructure/smtp-email.sender";
import { InMemoryRateLimiter } from "@/server/security/in-memory-rate-limiter";
import { LoginLockoutService } from "@/server/security/login-lockout.service";
import { prisma } from "@/server/shared/prisma-client";

const appointmentRepository = new PrismaAppointmentRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const doctorProfileRepository = new PrismaDoctorProfileRepository(prisma);
const doctorStaffAssignmentRepository = new PrismaDoctorStaffAssignmentRepository(prisma);
const passwordResetRepository = new PrismaPasswordResetRepository(prisma);
const sessionRepository = new PrismaSessionRepository(prisma);
const passwordHasher = new ScryptPasswordHasher();
const emailSender = new SmtpEmailSender();
const rateLimiter = new InMemoryRateLimiter();
const loginLockout = new LoginLockoutService(
  env.LOGIN_LOCKOUT_MAX_ATTEMPTS,
  env.LOGIN_LOCKOUT_MINUTES,
);
const smsSender =
  env.SMS_PROVIDER === "kavenegar" && env.KAVENEGAR_API_KEY
    ? new KavenegarSmsSender(env.KAVENEGAR_API_KEY, env.KAVENEGAR_TEMPLATE)
    : new MockSmsSender();

const ensureDefaultSuperAdmin = new EnsureDefaultSuperAdminUseCase(userRepository, passwordHasher);
const ensureDefaultAdmin = new EnsureDefaultAdminUseCase(userRepository, passwordHasher);
const ensureDefaultStaff = new EnsureDefaultStaffUseCase(userRepository, passwordHasher);

type BootstrapStatus = {
  superAdmin: PublicUser;
  admin: PublicUser;
  staff: PublicUser;
};

let bootstrapStatusPromise: Promise<BootstrapStatus> | undefined;

const bootstrapAccounts = (): Promise<BootstrapStatus> =>
  Promise.all([
    ensureDefaultSuperAdmin.execute({
      username: env.DEFAULT_SUPER_ADMIN_USERNAME,
      password: env.DEFAULT_SUPER_ADMIN_PASSWORD,
    }),
    ensureDefaultAdmin.execute({
      username: env.DEFAULT_ADMIN_USERNAME,
      password: env.DEFAULT_ADMIN_PASSWORD,
    }),
    ensureDefaultStaff.execute({
      username: env.DEFAULT_STAFF_USERNAME,
      email: env.DEFAULT_STAFF_EMAIL,
      password: env.DEFAULT_STAFF_PASSWORD,
    }),
  ]).then(([superAdmin, admin, staff]) => ({ superAdmin, admin, staff }));

const getBootstrapStatus = (): Promise<BootstrapStatus> => {
  if (!bootstrapStatusPromise) {
    bootstrapStatusPromise = bootstrapAccounts();
  }

  return bootstrapStatusPromise;
};

export const services = {
  env,
  security: {
    rateLimiter,
    loginLockout,
  },
  auth: {
    smsSender,
    registerPatient: new RegisterPatientUseCase(userRepository, passwordHasher),
    login: new LoginUseCase(userRepository, passwordHasher),
    createAdmin: new CreateAdminUseCase(userRepository, passwordHasher),
    createStaff: new CreateStaffUseCase(userRepository, passwordHasher),
    listUsers: new ListUsersUseCase(userRepository),
    setUserActive: new SetUserActiveUseCase(userRepository),
    setUserRole: new SetUserRoleUseCase(userRepository),
    getPublicUser: new GetPublicUserUseCase(userRepository),
    forgotPassword: new ForgotPasswordUseCase(
      userRepository,
      passwordResetRepository,
      passwordHasher,
      smsSender,
      env.OTP_TTL_MINUTES,
    ),
    resetPassword: new ResetPasswordUseCase(
      userRepository,
      passwordResetRepository,
      passwordHasher,
    ),
    session: {
      create: new CreateSessionUseCase(sessionRepository, env.SESSION_TTL_HOURS),
      resolve: new ResolveSessionUseCase(sessionRepository),
      revoke: new RevokeSessionUseCase(sessionRepository),
    },
    bootstrapStatus: getBootstrapStatus,
  },
  appointment: {
    create: new CreateAppointmentUseCase(appointmentRepository),
    list: new ListAppointmentsUseCase(appointmentRepository),
    listByDoctorIds: new ListAppointmentsByDoctorIdsUseCase(appointmentRepository),
    findById: new FindAppointmentByIdUseCase(appointmentRepository),
    listMy: new ListMyAppointmentsUseCase(appointmentRepository),
    cancelMy: new CancelMyAppointmentUseCase(appointmentRepository),
    updateStatus: new UpdateAppointmentStatusUseCase(appointmentRepository),
    updateByStaff: new UpdateAppointmentByStaffUseCase(appointmentRepository),
    deleteByStaff: new DeleteAppointmentByStaffUseCase(appointmentRepository),
  },
  doctorProfile: {
    getMy: new GetMyDoctorProfileUseCase(doctorProfileRepository),
    upsertMy: new UpsertMyDoctorProfileUseCase(doctorProfileRepository),
  },
  doctorStaffAssignment: {
    listAssignableStaff: new ListAssignableStaffUseCase(userRepository),
    listAssignedStaffForDoctor: new ListAssignedStaffForDoctorUseCase(
      doctorStaffAssignmentRepository,
      userRepository,
    ),
    assignStaffToDoctor: new AssignStaffToDoctorUseCase(
      doctorStaffAssignmentRepository,
      userRepository,
    ),
    unassignStaffFromDoctor: new UnassignStaffFromDoctorUseCase(doctorStaffAssignmentRepository),
    listDoctorsForStaff: new ListDoctorsForStaffUseCase(
      doctorStaffAssignmentRepository,
      userRepository,
    ),
    repository: doctorStaffAssignmentRepository,
  },
  staffEmail: {
    notify: new NotifyStaffUseCase(emailSender),
  },
};
