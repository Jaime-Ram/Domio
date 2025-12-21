import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckItemText } from "./pricing-tier-card"
import { cn } from "@/lib/utils"

interface PricingTierCardIconProps {
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: React.ComponentType<any>
  cta?: React.ReactNode
  className?: string
}

export function PricingTierCardIcon({
  title,
  subtitle,
  description,
  features,
  icon: Icon,
  cta,
  className,
}: PricingTierCardIconProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#002A1F]/10">
          <Icon className="h-6 w-6 text-[#002A1F]" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="mt-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{subtitle}</p>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <CheckItemText key={index} text={feature} size="sm" />
          ))}
        </ul>
      </CardContent>
      {cta && <CardFooter>{cta}</CardFooter>}
    </Card>
  )
}

