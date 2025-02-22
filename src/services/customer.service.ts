
import { revalidateTag } from "next/cache";
import { getCacheTag } from "./cache-tags";
import { PaginatedResponse } from "@/types/paginated-response.type";
import { Customer, CustomerType } from "@/types/cutomer.type";
import { CustomerSchemaType, UpdateCustomerSchemaType } from "@/schemas/customer.schema";
import { InterestSchemaType } from "@/schemas/interest-schema";
import { Interest } from "@/types/interest.type";
import { getAuthHeaders } from "@/lib/auth";



const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export const getCustomers = async (customer: CustomerType, authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/customer/${customer}`, {
        headers: await getAuthHeaders(authToken),
        next: {
          tags: [getCacheTag('customers', 'all')],
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as PaginatedResponse<Customer>;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  export const getCustomerById = async (customerId:string, authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
        headers: await getAuthHeaders(authToken),
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as Customer;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

export const createCustomer = async (
    values: CustomerSchemaType, authToken?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('customers', 'all'));
        return data as Customer;
      } else {
        console.error('Error en la respuesta:', data);
        return null;
      }
    } catch (error) {
      console.error('Error en create customers:', error);
      return null;
    }
  };

  export const updateCustomer = async (
    id: string,
    cutomer: Partial<UpdateCustomerSchemaType>, authToken?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(cutomer),
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('customers', 'all'));
        return data as Customer;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  export const deleteCustomer = async (id: string, authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/${id}`, {
        headers: await getAuthHeaders(authToken),
        method: 'DELETE',
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('customers', 'all'));
        return data;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };


  export const historialReceipts = async (
    customerId: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/receipts/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  export const cancelReceipt = async (
    customerId: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/receipts/cancelReceipt/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  export const createInterest = async (
    values: InterestSchemaType, authToken?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/interestSetting`, {
        method: 'POST',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('interests', 'all'));
        return data as Interest;
      } else {
        console.error('Error en la respuesta:', data);
        return null;
      }
    } catch (error) {
      console.error('Error en create intereses:', error);
      return null;
    }
  }

  export const getinterests = async ( authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/interestSetting`, {
        headers: await getAuthHeaders(authToken),
        next: {
          tags: [getCacheTag('interests', 'all')],
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as Interest;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
