export type UserRoleID = 1 | 2 | 3;
export type UserRoleName = 'Admin' | 'Doctor' | 'Patient';

export type UserGenderID = 1 | 2 | 3;
export type UserGenderName = 'Male' | 'Female' | 'Other';

export interface Gender {
  id: UserGenderID;
  name: UserGenderName;
}

export interface Role {
  id: UserRoleID;
  name: UserRoleName;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: Gender;
  role: Role;
  is_active: boolean;
  avatar?: string;
}

export interface AuthSuccessResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  password_confirm: string;
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: UserGenderID;
  role: UserRoleID;
  avatar?: string;
}

export interface AuthValidationErrorResponse {
  message: string;
  errors: {
    non_field_errors?: string[];
    [key: string]: string[] | undefined;
  };
}

export interface AuthExceptionResponse {
  success: false;
  message: string;
}

export type AuthResponse =
  | AuthSuccessResponse
  | AuthValidationErrorResponse
  | AuthExceptionResponse;