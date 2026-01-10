export const AUTH_MODES = {
  SIGNIN: "signin",
  SIGNUP: "signup",
} as const;

export type IAuthMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];
