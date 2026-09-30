export interface QuoteRequest{
    productId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    notes?:string;
}

export interface EnquiryResponse{
    isSuccess: boolean;
    enquiryId?:string;
}