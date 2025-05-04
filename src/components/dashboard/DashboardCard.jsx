import Link from 'next/link';

export default function DashboardCard({ title, description, icon, link, bgColor = 'bg-blue-500' }) {
  return (
    <Link href={link}>
      <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 shadow-sm rounded-lg overflow-hidden transition-shadow hover:shadow-lg">
        <div className="absolute inset-0">
          <div className={`${bgColor} absolute h-12 w-full opacity-0 group-hover:opacity-10 transition-opacity`}></div>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex-shrink-0">
            <span className={`inline-flex p-3 ${bgColor} rounded-lg text-white`}>
              {icon}
            </span>
          </div>
          <div className="ml-4 w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex-shrink-0 self-center">
            <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}