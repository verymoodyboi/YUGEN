
export interface RegisterInput {
  FName: string;
  LName: string;
  UserName: string;
  Bio?: string;
  Email: string;
  Password: string;
  BirthDate: string;
  Gender: string;
  Region: string;
}

export interface RegisterGoogleInput extends Omit<RegisterInput, 'Password'> {
  auth_id: string;
}
