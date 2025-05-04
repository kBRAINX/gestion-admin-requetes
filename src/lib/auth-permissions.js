// Roles and permissions constants
export const ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    SERVICE_HEAD: 'service_head',
    SERVICE_MEMBER: 'service_member',
    EMPLOYEE: 'employee',
    STUDENT: 'student',
  };

  export const PERMISSIONS = {
    // Global permissions
    MANAGE_SYSTEM: 'manage_system',
    MANAGE_USERS: 'manage_users',
    MANAGE_SERVICES: 'manage_services',
    MANAGE_REQUEST_TYPES: 'manage_request_types',

    // Request permissions
    VIEW_ALL_REQUESTS: 'view_all_requests',
    APPROVE_REQUESTS: 'approve_requests',
    REJECT_REQUESTS: 'reject_requests',
    TRANSFER_REQUESTS: 'transfer_requests',
    CREATE_REQUESTS: 'create_requests',
    VIEW_OWN_REQUESTS: 'view_own_requests',

    // Resource permissions
    MANAGE_RESOURCES: 'manage_resources',
    MANAGE_RESERVATIONS: 'manage_reservations',
    VIEW_RESOURCES: 'view_resources',
    VIEW_BOOKINGS: 'view_bookings',
    BOOK_RESOURCES: 'book_resources',

    // Analytics permissions
    VIEW_ANALYTICS: 'view_analytics',
    GENERATE_REPORTS: 'generate_reports',
  };

  // Role-based permissions mapping
  export const ROLE_PERMISSIONS = {
    [ROLES.SUPERADMIN]: Object.values(PERMISSIONS),
    [ROLES.ADMIN]: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_SERVICES,
      PERMISSIONS.VIEW_ALL_REQUESTS,
      PERMISSIONS.APPROVE_REQUESTS,
      PERMISSIONS.REJECT_REQUESTS,
      PERMISSIONS.TRANSFER_REQUESTS,
      PERMISSIONS.MANAGE_RESOURCES,
      PERMISSIONS.MANAGE_RESERVATIONS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.GENERATE_REPORTS,
    ],
    [ROLES.SERVICE_HEAD]: [
      PERMISSIONS.VIEW_ALL_REQUESTS,
      PERMISSIONS.APPROVE_REQUESTS,
      PERMISSIONS.REJECT_REQUESTS,
      PERMISSIONS.TRANSFER_REQUESTS,
      PERMISSIONS.MANAGE_RESOURCES,
      PERMISSIONS.VIEW_BOOKINGS,
    ],
    [ROLES.SERVICE_MEMBER]: [
      PERMISSIONS.APPROVE_REQUESTS,
      PERMISSIONS.TRANSFER_REQUESTS,
      PERMISSIONS.VIEW_RESOURCES,
      PERMISSIONS.VIEW_BOOKINGS,
    ],
    [ROLES.EMPLOYEE]: [
      PERMISSIONS.CREATE_REQUESTS,
      PERMISSIONS.VIEW_OWN_REQUESTS,
      PERMISSIONS.VIEW_RESOURCES,
      PERMISSIONS.BOOK_RESOURCES,
    ],
    [ROLES.STUDENT]: [
      PERMISSIONS.CREATE_REQUESTS,
      PERMISSIONS.VIEW_OWN_REQUESTS,
      PERMISSIONS.VIEW_RESOURCES,
      PERMISSIONS.BOOK_RESOURCES,
    ],
  };

  // Request types categories
  export const REQUEST_CATEGORIES = {
    RESOURCES: 'resources',
    ADMINISTRATION: 'administration',
    MAINTENANCE: 'maintenance',
    ACADEMIC: 'academic',
    FINANCIAL: 'financial',
    HR: 'hr'
  };

  // Request status
  export const REQUEST_STATUS = {
    SUBMITTED: 'submitted',
    IN_REVIEW: 'in_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    TRANSFERRED: 'transferred',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  // Email templates
  export const EMAIL_TEMPLATES = {
    REQUEST_RECEIVED: 'request_received',
    REQUEST_APPROVED: 'request_approved',
    REQUEST_REJECTED: 'request_rejected',
    REQUEST_TRANSFERRED: 'request_transferred',
    RESERVATION_CONFIRMED: 'reservation_confirmed',
    RESERVATION_CANCELLED: 'reservation_cancelled'
  };