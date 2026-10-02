export interface QuoteRequest{
    productId?: string|null;//null in case contact form submission
    firstName: string;
    lastName:string;
    email: string;
    phoneNumber: string;
    message?:string;
}
export type EnquiryResponse = string;
