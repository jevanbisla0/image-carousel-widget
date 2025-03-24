import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { UI_STYLES } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-800 group-[.toaster]:border-2 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-md group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-gray-700 group-[.toast]:border group-[.toast]:border-gray-300 group-[.toast]:shadow-sm group-[.toast]:rounded-md group-[.toast]:hover:bg-gray-50",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:border group-[.toast]:border-gray-300 group-[.toast]:shadow-sm group-[.toast]:rounded-md group-[.toast]:hover:bg-gray-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
