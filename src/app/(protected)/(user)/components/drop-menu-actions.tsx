"use client"

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Customer } from '@/types/cutomer.type';
import { MoreHorizontal, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import GenerateReceiptsButton from './all-receipts-button';
import { ExportCustomersExcel } from './export-customers-excel';

export function DropdownMenuAction({customers} : {customers: Customer[]}){
    const [openDropdown, setOpenDropdown] = useState(false);

    return(
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel className="text-sm sm:text-base">Acciones</DropdownMenuLabel>
            <>
              <DropdownMenuSeparator />
                <GenerateReceiptsButton customers={customers} />
                <ExportCustomersExcel customers={customers} />
            </>       
        </DropdownMenuContent>
      </DropdownMenu>

    )
}