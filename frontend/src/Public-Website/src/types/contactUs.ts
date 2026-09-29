export interface ContactUsForm{
    name: string;
    email: string;
    phoneNumber: string;
    message: string;
}

export interface ContactUsResponse{
    success: boolean;
    enquiryId?:string;
}