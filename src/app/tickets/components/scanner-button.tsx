"use client";
import { useState, useRef, startTransition } from "react";
import { startScanner } from "@/services/scanner.service";
import { toast } from "sonner";

export default function ScannerButton() {
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (barCode: string) => {
    startTransition(() => {
      startScanner({ barCode }).then((data) => {
        console.log("Respuesta del scanner:", data);
        if (!data || "error" in data) {
          toast.error(data?.error || "Error desconocido");
        } else {
          toast.success("Escaneo exitoso");
        }
        setIsScanning(false);
      }).catch((err) => {
        console.error("Error en startScanner:", err);
        toast.error("Error en la solicitud.");
        setIsScanning(false);
      });
    });
  };
  

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleStartScanner}
        disabled={isScanning}
        className={`px-6 py-3 rounded-lg font-bold text-white transition ${
          isScanning ? "bg-gray-700 cursor-not-allowed" : "bg-gray-700 hover:bg-[#fffc34] hover:text-black"
        }`}
      >
        {isScanning ? "Escaneando..." : "Escánear"}
      </button>

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
