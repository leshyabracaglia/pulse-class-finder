export const AUTH_MODES = {
  SIGNIN: "signin",
  SIGNUP: "signup",
} as const;

export type IAuthMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];

export const USER_TYPES = {
  USER: "user",
  COMPANY: "company",
} as const;

export type IUserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];