import Image from 'next/image';

interface HeaderProps {
  label: string;
}

export function Header({ label }: HeaderProps) {
  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center">
      <Image
        src="/bm-logo.svg"
        alt="BetMasters"
        width={900}
        height={900}
        className="h-24 md:h-28"
      />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
