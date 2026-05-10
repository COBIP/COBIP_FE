export interface SignUpFormData {
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  confirmPassword: string; 
  nickname: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EmailVerificationSendRequest {
  email: string;
}

export interface EmailVerificationConfirmRequest {
  email: string;
  code: string;
}