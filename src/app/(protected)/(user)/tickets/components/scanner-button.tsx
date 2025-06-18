import { useState, useRef, useEffect, startTransition } from "react";
import { startScanner } from "@/services/scanner.service";
import { toast } from "sonner";
import { PaymentTypeReceiptDialog } from "../../components/payment-type-receipt-dialog"; // asegúrate de importar esto
import { getCustomerById } from "@/services/customers.service";
import { historialReceiptsAction } from "@/actions/receipts/create-receipt.action";
import { useSession } from "next-auth/react";
import { OpenScannerDialog } from "../../components/open-scanner-dialog";
import { Customer } from "@/types/cutomer.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ScannerButton({ isDialogOpen }: { isDialogOpen: boolean }) {
  const [isScanning, setIsScanning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<"TRANSFER" | "CASH" | "CHECK" | null>(null);
  const session = useSession();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>();
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [manualBarCode, setManualBarCode] = useState("");

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isDialogOpen && !isScanning && !manualInputVisible) {
          setIsScanning(true);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      };

      const handleKeyUp = () => {
        setIsScanning(false);
      };

      if (!isDialogOpen && !manualInputVisible) {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, [isDialogOpen, manualInputVisible]);


  useEffect(() => {
  const interval = setInterval(() => {
    if (inputRef.current) {
      inputRef.current.value = ""; // limpiar el input
    }
  }, 50000); // cada 30 segundos

  return () => clearInterval(interval); // limpiar cuando el componente se desmonta
}, []);

  const handleSubmit = async (barCode: string) => {
    startTransition(() => {
      startScanner({ barCode })
        .then(async (data) => {
          console.log("DATA", data);
          if (!data || "error" in data) {
            toast.error(data?.error || "Error desconocido");
          } else {
            if (data.type === "RECEIPT") {
              toast.success("🧾 Recibo detectado", { duration: 5000 });
              setCustomerId(data.id);
  
              try {
                const fetchedCustomer = await getCustomerById(data.id || "", session.data?.token);
                if (!fetchedCustomer) {
                  toast.error("No se encontró el cliente.");
                  return;
                }
                setCustomer(fetchedCustomer);
                setDialogOpen(true); // <-- abrir el diálogo cuando ya tengas los datos
              } catch (error) {
                console.error("Error al obtener cliente:", error);
                toast.error("Error al obtener los datos del cliente.");
              }
            } else {
              toast.success("🎫 Ticket detectado", { duration: 3000 });
              setTimeout(() => {
                window.location.reload();
              }, 1000); // un poquito más que la duración del toast
            }
          }
  
          setIsScanning(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error en la solicitud.");
          setIsScanning(false);
        });
    });
  };
  

  const handleConfirm = async (paymentType: "TRANSFER" | "CASH" | "CHECK") => {
    if (!paymentType || !customerId) return;
  
    try {

      const updatedCustomer = await getCustomerById(customerId, session.data?.token);
  
      if (!updatedCustomer) {
        toast.error("No se pudieron obtener los datos actualizados del cliente.");
        return;
      }
      setCustomer(updatedCustomer); 
  
      const result = await historialReceiptsAction(customerId, {
        paymentType,
        print: false,
      });
  
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("Pago registrado exitosamente.", { duration: 5000 });
      }
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      toast.error("Error al registrar el pago.");
    } finally {
      setSelectedPaymentType(null);
      setDialogOpen(false);
    }
  };
  
 return (
  <div className="flex flex-col items-center gap-4">
    <p
      className={`text-lg font-semibold ${
        manualInputVisible
          ? "text-yellow-400"
          : isScanning
          ? "text-yellow-400"
          : "text-muted-foreground"
      }`}
    >
      {manualInputVisible
        ? "Ingreso manual activo"
        : isScanning
        ? "Escaneando..."
        : ""}
    </p>

    {/* Solo mostrar el input invisible si no está activo el modo manual */}
    {!manualInputVisible && (
      <input
        ref={inputRef}
        type="text"
        autoFocus
        onBlur={() => setIsScanning(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />
    )}

    <Button
      variant="default"
      size="sm"
      onClick={() => setManualInputVisible((prev) => !prev)}
    >
      {manualInputVisible
        ? "Cancelar ingreso manual"
        : "Ingresar código manualmente"}
    </Button>

    {manualInputVisible && (
      <div className="w-full max-w-md flex flex-col items-center gap-4 mt-4">
        <Input
          value={manualBarCode}
          onChange={(e) => setManualBarCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(manualBarCode);
              setManualBarCode("");
              setManualInputVisible(false);
            }
          }}
          placeholder="Ingrese el código manualmente"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            handleSubmit(manualBarCode);
            setManualBarCode("");
            setManualInputVisible(false);
          }}
        >
          Confirmar código
        </Button>
      </div>
    )}

    <OpenScannerDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onConfirm={handleConfirm}
      customer={customer}
    />
  </div>
);

}
