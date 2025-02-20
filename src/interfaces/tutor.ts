export default interface Tutor{
    _id?: string;
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
    documents?: string;
    is_verified?: boolean;
    status?: 'pending' | 'approved' | 'rejected' |  'blocked'
}


export interface Login {
    email: string;
    password: string;
}
