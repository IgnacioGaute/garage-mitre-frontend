import { RenterSchemaType } from "@/schemas/renter-schema";
import { revalidateTag } from "next/cache";
import { getCacheTag } from "./cache-tags";
import { Renter } from "@/types/renter.type";
import { PaginatedResponse } from "@/types/paginated-response.type";



const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export const getRenters = async () => {
    try {
      const response = await fetch(`${BASE_URL}/renters`, {
        headers: {
            'Content-Type': 'application/json',
          },
        next: {
          tags: [getCacheTag('renters', 'all')],
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as PaginatedResponse<Renter>;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

export const createRenter = async (
    values: RenterSchemaType
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/renters`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('renters', 'all'));
        return data as Renter;
      } else {
        console.error('Error en la respuesta:', data);
        return null;
      }
    } catch (error) {
      console.error('Error en create renter:', error);
      return null;
    }
  };

  export const updateRenter = async (
    id: string,
    renter: Partial<RenterSchemaType>,
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/renters/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(renter),
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('renters', 'all'));
        return data as Renter;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  export const deleteRenter = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/renters/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('renters', 'all'));
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