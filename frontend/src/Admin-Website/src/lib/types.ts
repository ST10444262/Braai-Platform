export type Role = "SuperAdmin" | "Admin" | "Employee";

export interface Me {
  staffId: string | null;
  email: string;
  fullName: string;
  role: Role;
  twoFactorEnabled: boolean;
}

export interface LoginResponse {
  success: boolean;
  requiresTwoFactor: boolean;
  requiresTwoFactorSetup?: boolean;
  message: string;
  token?: string | null;
  userId?: string | null;
  twoFactorChallenge?: string | null;
}

export interface Enquiry {
  enquiryId: string;
  enquiryType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  productId?: string | null;
  product?: { name: string } | null;
  customOptionId?: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  clientId?: string | null;
}

export interface ProductImage {
  imageId: string;
  url: string;
  isPrimary: boolean;
}

export interface Product {
  productId: string;
  name: string;
  category: string;
  productType: string;
  brand: string;
  isImported: boolean;
  isCustomisable: boolean;
  price: number;
  onSpecial?: number | null;
  description: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  fuelType?: string;
  braaiType?: string;
  heatOutputKw?: number;
  fireplaceType?: string;
}

export interface Note {
  noteId: string;
  content: string;
  createdAt: string;
  clientId: string;
  staffAccountId: string;
  author?: { fullName: string } | null;
}

export interface Invoice {
  invoiceId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  clientId: string;
  staffAccountId: string;
}

export interface Client {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  physicalAddress: string;
  createdAt: string;
  invoiceRecords?: Invoice[];
  internalNotes?: Note[];
}

export interface Staff {
  staffId: string;
  identityUserId: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  receiveQuoteEmails: boolean;
  createdAt: string;
}

export interface Overview {
  leadPipeline: { new: number; contacted: number; converted: number; dead: number; conversionRate: number };
  catalogueStatus: { totalBraais: number; totalFireplaces: number };
  recentQuoteRequests: Enquiry[];
  systemHealth?: { apiConnection: string; database: string; redisCache: string; storageService: string } | null;
}