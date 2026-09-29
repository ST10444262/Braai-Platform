//const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''; //confirm url for api

//confirm this endpoint
//const CONTACTUS_ENDPOINT = "";

import { ContactUsForm, ContactUsResponse } from "@/types/contactUs";
export async function submitEnquiry(payload: ContactUsForm): Promise<ContactUsResponse>
{
    //Must implement controller call to api

    console.log('Mock enquiry submitted:', payload); // remove before final submission. Just dummy for now until i have controller call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, enquiryId: 'mock-id-123' };
}