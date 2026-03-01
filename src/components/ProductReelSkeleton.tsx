import { Skeleton } from './ui/skeleton'

interface ProductReelSkeletonProps {
  title?: string
  subtitle?: string
  count?: number
}

const ProductReelSkeleton = ({
  title,
  subtitle,
  count = 4,
}: ProductReelSkeletonProps) => {
  return (
    <section className='py-12'>
      <div className='md:flex md:items-center md:justify-between mb-4'>
        <div className='max-w-2xl px-4 lg:max-w-4xl lg:px-0'>
          {title ? (
            <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
              {title}
            </h1>
          ) : (
            <Skeleton className='h-10 w-56' />
          )}
          {subtitle ? (
            <p className='mt-2 text-sm text-muted-foreground'>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className='relative'>
        <div className='mt-6 flex items-center w-full'>
          <div className='w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8'>
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className='flex flex-col w-full'>
                <div className='relative bg-zinc-100 aspect-square w-full overflow-hidden rounded-xl'>
                  <Skeleton className='h-full w-full' />
                </div>
                <Skeleton className='mt-4 w-2/3 h-4 rounded-lg' />
                <Skeleton className='mt-2 w-16 h-4 rounded-lg' />
                <Skeleton className='mt-2 w-12 h-4 rounded-lg' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductReelSkeleton
