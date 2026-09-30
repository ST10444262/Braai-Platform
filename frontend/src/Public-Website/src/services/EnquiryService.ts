import { QuoteRequest, EnquiryResponse } from "@/types/enquiry";

export async function submitQuoteRequest(payload: QuoteRequest):Promise<EnquiryResponse>{

    //UPDATE WITH REAL QUOTE REQUEST API

  console.log('Mock quote request submitted:', payload);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { isSuccess: true, enquiryId: 'mock-id-456' };
}