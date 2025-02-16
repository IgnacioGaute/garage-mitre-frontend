"use client";
import { useState, useRef, useEffect, startTransition } from "react";
import { startScanner } from "@/services/scanner.service";
import { toast } from "sonner";

export default function ScannerButton() {
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para iniciar el escaneo cuando se presiona un botón
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isScanning) {
      setIsScanning(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Función para detener el escaneo cuando se suelta el botón
  const handleKeyUp = (e: KeyboardEvent) => {
    setIsScanning(false);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleSubmit = async (barCode: string) => {
    startTransition(() => {
      startScanner({ barCode })
        .then((data) => {
          console.log("Respuesta del scanner:", data);
          if (!data || "error" in data) {
            toast.error(data?.error || "Error desconocido");
          } else {
            toast.success("Escaneo exitoso");
          }
          setIsScanning(false);
        })
        .catch((err) => {
          console.error("Error en startScanner:", err);
          toast.error("Error en la solicitud.");
          setIsScanning(false);
        });
    });
  };

  return (
    <div className="flex flex-col items-center">
      <p className={`text-lg font-bold ${isScanning ? "text-[#fffc34]" : "text-gray-700"}`}>
        {isScanning ? "Escaneando..." : ""}
      </p>

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
    </div>
  );
}
