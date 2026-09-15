import { TicketRegistration } from "@/types/ticket-registration.type";
import { getCacheTag } from "./cache-tags";
import { PaginatedResponse } from "@/types/paginated-response.type";
import { Ticket } from "@/types/ticket.type";
import { TicketSchemaType, UpdateTicketSchemaType } from "@/schemas/ticket.schema";
import { revalidateTag } from "next/cache";
import { TicketRegistrationForDay } from "@/types/ticket-registration-for-day.type";
import { TicketRegistrationForDaySchemaType } from "@/schemas/ticket-registration-for-day.schema";
import { getAuthHeaders } from "@/lib/auth";
import { TicketPriceSchemaType, UpdateTicketPriceSchemaType } from "@/schemas/ticket-price.schema";
import { ticketPrice } from "@/types/ticket-price";
import { TicketScheduleSchemaType } from "@/schemas/ticket-schedule.schema";
import { TicketPriceBracket } from "@/types/ticket-price-bracket.type";
import { TicketPriceBracketSchemaType, UpdateTicketPriceBracketSchemaType } from "@/schemas/ticket-price-bracket.schema";
import { AdvancePaymentSchemaType } from "@/schemas/advance-payment.schema";

export type TicketSchedule = { dayStartHour: number; dayEndHour: number; graceMinutes: number; barcodeTicketsEnabled: boolean };



const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getTicketSchedule = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/schedule-settings`, {
      headers: await getAuthHeaders(authToken),
      next: {
        tags: [getCacheTag('ticketSchedule', 'all')],
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data as TicketSchedule;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateTicketSchedule = async (schedule: TicketScheduleSchemaType, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/schedule-settings`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(schedule),
    });
    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('ticketSchedule', 'all'));
      return data as TicketSchedule;
    } else {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getTicketPriceBrackets = async (vehicleType?: string, authToken?: string) => {
  try {
    const url = new URL(`${BASE_URL}/tickets/priceBrackets`);
    if (vehicleType) url.searchParams.set('vehicleType', vehicleType);
    const response = await fetch(url.toString(), {
      headers: await getAuthHeaders(authToken),
      next: {
        tags: [getCacheTag('priceBrackets', 'all')],
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data as TicketPriceBracket[];
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createTicketPriceBracket = async (bracket: TicketPriceBracketSchemaType, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/priceBrackets`, {
      method: 'POST',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(bracket),
    });
    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('priceBrackets', 'all'));
      return data as TicketPriceBracket;
    } else {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateTicketPriceBracket = async (
  id: string,
  bracket: Partial<UpdateTicketPriceBracketSchemaType>,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/priceBrackets/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(bracket),
    });

    const data = await response.json();
    revalidateTag(getCacheTag('priceBrackets', 'all'));
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Error en updateTicketPriceBracket:', error);
    throw error;
  }
};

export const deleteTicketPriceBracket = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/priceBrackets/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(authToken),
    });

    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('priceBrackets', 'all'));
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

export const getTicketsPrice = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/ticketsPrice`, {
      headers: await getAuthHeaders(authToken),
      next: {
        tags: [getCacheTag('ticketsPrice', 'all')],
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data as PaginatedResponse<ticketPrice>;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};


export const createTicketPrice = async (ticket: TicketPriceSchemaType, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/ticketsPrice`, {
      method: 'POST',
        headers: await getAuthHeaders(authToken),
      body: JSON.stringify(ticket),
    });
    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('ticketsPrice', 'all'));
      return data as Ticket;
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

export const updateTicketPrice = async (
  id: string,
  ticket: Partial<UpdateTicketPriceSchemaType>,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/ticketsPrice/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(ticket),
    });

    const data = await response.json();
    revalidateTag(getCacheTag('ticketsPrice', 'all'));
    revalidateTag(getCacheTag('tickets', 'all'));
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

export const deleteTicketPrice = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/ticketsPrice/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(authToken),
    });

    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('ticketsPrice', 'all'));
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


export const getTickets = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets`, {
      headers: await getAuthHeaders(authToken),
      next: {
        tags: [getCacheTag('tickets', 'all')],
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data as PaginatedResponse<Ticket>;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};


export const createTicket = async (ticket: TicketSchemaType, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
        headers: await getAuthHeaders(authToken),
      body: JSON.stringify(ticket),
    });
    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('tickets', 'all'));
      return data as Ticket;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateTicket = async (
  id: string,
  ticket: Partial<UpdateTicketSchemaType>,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(ticket),
    });

    const data = await response.json();
    revalidateTag(getCacheTag('tickets', 'all'));
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

export const deleteTicket = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(authToken),
    });

    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('tickets', 'all'));
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

export const getTicketRegistrations = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/registrations`, {
      headers: await getAuthHeaders(authToken),
      next: {
        tags: [getCacheTag('tickets', 'all')],
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

  
  export const addAdvancePayment = async (
    id: string,
    dto: AdvancePaymentSchemaType,
    authToken?: string,
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/tickets/registrations/${id}/advance-payment`, {
        method: 'PATCH',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(dto),
      });

      const data = await response.json();
      revalidateTag(getCacheTag('tickets', 'all'));

      if (!response.ok) {
        console.error(data);
        return {
          error: {
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Error desconocido',
          },
        };
      }

      return data as TicketRegistration;
    } catch (error) {
      console.error(error);
      return { error: { code: 'UNKNOWN_ERROR', message: 'Error desconocido' } };
    }
  };

  export const setPaymentMethod = async (
    id: string,
    metodo: 'CASH' | 'TRANSFER',
    authToken?: string,
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/tickets/registrations/${id}/payment-method`, {
        method: 'PATCH',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify({ metodo }),
      });

      const data = await response.json();
      revalidateTag(getCacheTag('tickets', 'all'));

      if (!response.ok) {
        console.error(data);
        return {
          error: {
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Error desconocido',
          },
        };
      }

      return data as TicketRegistration;
    } catch (error) {
      console.error(error);
      return { error: { code: 'UNKNOWN_ERROR', message: 'Error desconocido' } };
    }
  };

  export const getTicketRegistrationById = async (id: string, authToken?: string) => {
    try {
      if (!id) return null;
  
      const response = await fetch(`${BASE_URL}/tickets/registrations/${id}`, {
        headers: await getAuthHeaders(authToken),
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

  export const createTicketRegistrationForDay = async (ticket: TicketRegistrationForDaySchemaType, authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/tickets/registrationForDays`, {
        method: 'POST',
        headers: await getAuthHeaders(authToken),
        body: JSON.stringify(ticket),
      });
      const data = await response.json();
  
      if (response.ok) {
        revalidateTag(getCacheTag('registrationForDays', 'all'));
        return data as TicketRegistrationForDay;
      } else {
        console.error(data);
        return { error: { code: data.code || 'UNKNOWN_ERROR', message: data.message || 'Error desconocido' } };
      }
    } catch (error) {
      console.error(error);
      return { error: { code: 'UNKNOWN_ERROR', message: 'Error desconocido' } };
    }
  };

  export const getTicketsRegistrationForDay = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/registrationForDays`, {
      headers: await getAuthHeaders(authToken),
      next: {
        tags: [getCacheTag('registrationForDays', 'all')],
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data as TicketRegistrationForDay[]
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateTicketStatus = async (
  id: string,
  ticket: Partial<TicketRegistrationForDaySchemaType>,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/registrationForDays/${id}/status`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(ticket),
    });

    const data = await response.json();
    revalidateTag(getCacheTag('registrationForDays', 'all'));
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

export const retireOverdueRegistrations = async (ids: string[], authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/registrationForDays/retire-many`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify({ ids }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }

    revalidateTag(getCacheTag('registrationForDays', 'all'));
    return data;
  } catch (error) {
    console.error(error);
    return { error: { code: 'UNKNOWN_ERROR', message: 'Error desconocido' } };
  }
};

export const deleteTicketRegistrationForDay = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/tickets/registrationForDays/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(authToken),
    });

    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('registrationForDays', 'all'));
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


