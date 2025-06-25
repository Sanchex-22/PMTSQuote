// components/ui/alert.tsx
import type { FC, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

// Define los estilos base y las variantes con CVA
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-red-500/50 text-red-700 bg-red-100 dark:border-red-500 [&>svg]:text-red-700",
        success:
          "border-green-500/50 text-green-800 bg-green-100 dark:border-green-500 [&>svg]:text-green-800",
        warning:
          "border-amber-500/50 text-amber-800 bg-amber-100 dark:border-amber-500 [&>svg]:text-amber-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const icons = {
  destructive: <XCircle className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  default: <Info className="h-5 w-5" />,
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  children: ReactNode;
}

const Alert: FC<AlertProps> = ({ className, variant, title, children, ...props }) => {
  const icon = icons[variant || "default"];

  return (
    <div role="alert" className={alertVariants({ variant, className })} {...props}>
      {icon}
      {title && <h5 className="mb-1 font-bold leading-none tracking-tight">{title}</h5>}
      <div className="text-sm [&_p]:leading-relaxed">{children}</div>
    </div>
  );
};

export { Alert };