import { RenterSchemaType } from "@/schemas/renter-schema";
import { revalidateTag } from "next/cache";
import { getCacheTag } from "./cache-tags";
import { Renter } from "@/types/renter.type";
import { PaginatedResponse } from "@/types/paginated-response.type";
import { Owner } from "@/types/owner.type";
import { OwnerSchemaType } from "@/schemas/owner.schema";



const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export const getOwners = async () => {
    try {
      const response = await fetch(`${BASE_URL}/owners`, {
        headers: {
            'Content-Type': 'application/json',
          },
        next: {
          tags: [getCacheTag('owners', 'all')],
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as PaginatedResponse<Owner>;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

export const createOwner = async (
    values: OwnerSchemaType
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/owners`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('owners', 'all'));
        return data as Owner;
      } else {
        console.error('Error en la respuesta:', data);
        return null;
      }
    } catch (error) {
      console.error('Error en create owner:', error);
      return null;
    }
  };

  export const updateOwner = async (
    id: string,
    owner: Partial<RenterSchemaType>,
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/owners/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(owner),
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('owners', 'all'));
        return data as Owner;
      } else {
        console.error(data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  export const deleteOwner = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/owners/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('owners', 'all'));
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