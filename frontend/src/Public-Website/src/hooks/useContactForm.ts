'use client';


import { useState, FormEvent } from "react"; //useState is used for storing data that changes
import { submitEnquiry } from "@/services/ContactUsService";
import { ContactUsForm } from "@/types/contactUs";

//creates the structure for the error messages
//? is used as all fields are null until they receive an error message
type FormErrors ={
    name?:string;
    email?:string;
    phoneNumber?:string;
    message?:string;
};

//used as a reusable object where all the input fields on the form start as an empty string
const initialStateOfForm: ContactUsForm = {
    name:"", 
    email:"",
    phoneNumber:"",
    message:"",
};

export function useContactUsForm(){
  //holds the current text values typed into the form. Setformdata is the function used to update the formdata
  const [formData, setFormData] = useState<ContactUsForm>(initialStateOfForm);
  //holds validation messages for all the fields that fail the validation
  const [errors, setErrors] = useState<FormErrors>({});

  // submitting is true while waiting for the apis response(will be used to show a spinner while form submission is loading)
  const [submitting, setSubmitting] = useState(false);
  //changes to true after the contact us form message is successfully sent
  const [submitted, setSubmitted] = useState(false);
  //holds a server error if the sending fails or returns null if there are no errors
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Used whenever a user types into the input fields in the form
  function handleChange(field: keyof ContactUsForm, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // checking if the email address is in a valid format using regex
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Validating all inputs and returns true if valid
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please enter your phone number.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a message.';
    }

    //saves the collected error messages into react state so the ui can display them
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; //counts how many errors exist. returns true if there are no errors and false if there are errors
  }

  // Handles form submission logic
  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); //stops the page from refreshing when the form is submitted
    setSubmitError(null);

    // Stop if validation fails
    if (!validate()) return;

    setSubmitting(true);

    //tries to send data to api and catches any errors
    try {
      await submitEnquiry(formData);
      setSubmitted(true);
      setFormData(initialStateOfForm); // Reset form when user sends message
    } catch (err) {
      console.error('Contact us form submission failed:', err);
      setSubmitError("We could not send your message. Please try again, or call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return {formData, errors, submitting, submitted, submitError, handleChange, handleSubmit}
}