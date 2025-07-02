import { cn } from '@/lib/utils'

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-soft transition-all duration-200',
        hover && 'hover:shadow-strong hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

const CardDescription = ({ children, className, ...props }) => {
  return (
    <p
      className={cn('text-sm text-gray-600 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
}

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

