export interface IUser {
    id: string;
    refreshToken: string;
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
  }
  