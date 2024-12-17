import * as React from "react";

const Slot = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <span {...props} ref={ref}>
    {children}
  </span>
));

Slot.displayName = "Slot";

export default Slot;
