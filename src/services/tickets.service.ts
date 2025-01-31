import { TicketRegistration } from "@/types/ticket-registration.type";



const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export const getTicketRegistrations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/registrations`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        tags: ['tickets'],
      },
    });

    const data = await response.json();

    if (response.ok) {
      return data as TicketRegistration[];

    } else {
      console.error(data);
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};

  
  export const getTicketRegistrationById = async (id: string) => {
    try {
      if (!id) return null;
  
      const response = await fetch(`${BASE_URL}/tickets/registrations/${id}`, {
        headers: {
            'Content-Type': 'application/json',
          },
      });
      const data = await response.json();
  
      if (response.ok) {
        return data as TicketRegistration;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };