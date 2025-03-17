import * as React from "react";

import { cn } from "@/lib/utils";

function Label({
  className,
  htmlFor,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      htmlFor={htmlFor}
      data-slot="label"
      className={cn(
        "text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
