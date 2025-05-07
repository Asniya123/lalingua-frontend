export default interface INotification{
    _id?: string;
    heading: string;
    isRead: boolean;
    url: string;
    from: string;
    fromModel:"User" | "Tutor" | "Admin";
    to: string;
    toModel:"User" | "Tutor" | "Admin";
    message: string;
    createdAt: Date;
  }