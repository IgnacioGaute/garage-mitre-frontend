'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.6)] group-[.toaster]:rounded-lg group-[.toaster]:overflow-hidden group-[.toaster]:border',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-[12.5px]',
          actionButton:
            'group-[.toast]:bg-gm-yellow group-[.toast]:text-gm-ink group-[.toast]:font-semibold group-[.toast]:text-[12px]',
          cancelButton:
            'group-[.toast]:bg-gm-surface-2 group-[.toast]:text-muted-foreground group-[.toast]:text-[12px]',
          success:
            'group-[.toaster]:!border-[hsl(120_35%_55%/0.3)] group-[.toaster]:!bg-[hsl(120_35%_55%/0.08)]',
          error:
            'group-[.toaster]:!border-destructive/30 group-[.toaster]:!bg-destructive/8',
          info:
            'group-[.toaster]:!border-gm-yellow/30 group-[.toaster]:!bg-gm-yellow/8',
          title: 'group-[.toast]:text-[13px] group-[.toast]:font-semibold',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
