export interface AcademicApplication {
  id?: number;
  username: string;
  academic_email: string;
  role: string;
  university: string;
  verification_file_path?: string | null;
  university_id: string;
  status: 'pending' | 'approved' | 'rejected';
}
