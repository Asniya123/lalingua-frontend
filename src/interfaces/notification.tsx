export default interface INotification{
    _id?: string;
    heading: string;
    isRead: boolean;
    url: string;
    from: string;
    fromModel:"User" | "Tutor" ;
    to: string;
    toModel:"User" | "Tutor" ;
    message: string;
     type?: string; 
  createdAt: string;
  }