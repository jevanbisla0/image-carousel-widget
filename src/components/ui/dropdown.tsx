import React from 'react';
import { DropdownPrimitive } from '@/components/ui/dropdown-primitive';
import { cn } from '@/lib/utils';

const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-surface p-1 shadow-md",
        className
      )}
      {...props}
    />
  </DropdownPrimitive.Portal>
));

export default DropdownContent; 