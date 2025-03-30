
import { revalidateTag } from "next/cache";
import { getCacheTag } from "./cache-tags";
import { PaginatedResponse } from "@/types/paginated-response.type";
import { Customer, CustomerType } from "@/types/cutomer.type";
import { CustomerSchemaType, UpdateCustomerSchemaType } from "@/schemas/customer.schema";
import { InterestSchemaType } from "@/schemas/interest-schema";
import { Interest } from "@/types/interest.type";
import { getAuthHeaders } from "@/lib/auth";
import { AmountCustomerSchemaType } from "@/schemas/amount-customer.schema";
import { AmountCustomer } from "@/types/amount-customer.type";
import { ReceiptSchemaType } from "@/schemas/receipt.schema";
import { ParkingType } from "@/types/parking-type";
import { ParkingTypeSchemaType, UpdateParkingTypeSchemaType } from "@/schemas/parking-type.schema";



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
        console.error(data);
        return {
          error: {
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Error desconocido'
          },
        };
      }
    } catch (error) {
      console.error('Error en create customers:', error);
      return null;
    }
  };


  export const updateCustomer = async (
    id: string,
    customer: Partial<UpdateCustomerSchemaType>, authToken?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(customer),
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

  type ReceiptResponse =
  | { receiptNumber: string; success?: true } // respuesta exitosa
  | { error: { code: string; message: string }; success?: false }; // error

  
  export const historialReceipts = async (
    customerId: string,
    values: ReceiptSchemaType
  ): Promise<ReceiptResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/receipts/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        return {
          receiptNumber: data.receiptNumber, // asegurate que tu backend devuelva esto
          success: true,
        };
      } else {
        console.error(data);
        return {
          error: {
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Error desconocido',
          },
          success: false,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Ocurrió un error al conectar con el servidor.',
        },
        success: false,
      };
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
        return {
          error: {
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Error desconocido'
          },
        };
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  export const numberGeneratorForAllCustomer = async (
    customerId: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/receipts/numberGenerator/${customerId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Evitá parsear si no hay contenido
      let data = null;
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
      
      if (response.ok) {
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
      const response = await fetch(`${BASE_URL}/customers/interestSetting/interest`, {
        headers: await getAuthHeaders(authToken),
        next: {
          tags: [getCacheTag('interests', 'all')],
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as Interest[];
      } else {
        console.error(data);
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  export const updateAmountCustomer = async (
    customer: Partial<AmountCustomerSchemaType>, authToken?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/update/updateAmount`, {
        method: 'PATCH',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(customer),
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as AmountCustomer;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  export const getParkingTypes = async (authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/parking/parkingTypes`, {
        headers: await getAuthHeaders(authToken),
        next: {
          tags: [getCacheTag('parkingTypes', 'all')],
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as PaginatedResponse<ParkingType>;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

export const createParkingType = async (
    values: ParkingTypeSchemaType, authToken?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/parking/parkingTypes`, {
        method: 'POST',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('parkingTypes', 'all'));
        return data as ParkingType;
      } else {
        console.error('Error en la respuesta:', data);
        return null;
      }
    } catch (error) {
      console.error('Error en create parkingTypes:', error);
      return null;
    }
  };

  export const updateParkingType = async (
    id: string,
    values: Partial<UpdateParkingTypeSchemaType>, authToken?: string
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/parking/parkingTypes/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(values),
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('parkingTypes', 'all'));
        return data as ParkingType;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  export const deleteParkingType = async (id: string, authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/customers/parking/parkingTypes/${id}`, {
        headers: await getAuthHeaders(authToken),
        method: 'DELETE',
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('parkingTypes', 'all'));
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

