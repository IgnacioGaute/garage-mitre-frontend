import Image from 'next/image';
import { Card, CardContent, CardFooter } from '../ui/card';

interface HeaderProps {
  label: string;
}
export function Header({ label }: HeaderProps) {
  return (
<header className="w-full py-6 flex justify-center">
  <Card className="shadow-md pt-5 w-full max-w-md flex flex-col justify-center items-center">
    <CardContent className="flex flex-col justify-center items-center h-full">
      {/* Logo y Nombre */}
      <h1 className="text-3xl font-bold uppercase text-[#fffc34] hover:text-white text-center">
        GARAGE{" "}
        <span className="text-white hover:text-[#fffc34]">MITRE</span>
      </h1>
    </CardContent>
  </Card>
</header>

  );
}

