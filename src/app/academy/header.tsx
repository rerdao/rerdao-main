import { BrandLogo } from '@/components/brand'

export default function AcademyHeader() {
  return (
    <div className="flex flex-col @xl:flex-row gap-2 items-center justify-center">
      <BrandLogo size={56} />
      <h3 className="text-center">
        <span className="font-thin">Sentre</span> Academy
      </h3>
    </div>
  )
}
