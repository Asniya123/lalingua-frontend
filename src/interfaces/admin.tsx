export default interface Admin {
    _id?: string;
    name?: string;
    email?: string;
    password?: string;
    adminId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}
