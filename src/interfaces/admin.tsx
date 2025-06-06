export default interface Admin {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  adminId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface Icategory {
  _id:string,
  name: string,
  description: string,
  imageUrl: string
}

export interface ILanguage{
  _id: string,
  name: string,
  imageUrl: string
}

