export interface IAuthUser {
  token: string;
  user: IUser;
  roles: string[];
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  year: '1' | '2' | '3' | '4' | null;
  section: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | null;
  email_verified_at: null;
  created_at: Date;
  updated_at: Date;
}
