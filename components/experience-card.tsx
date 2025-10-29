import Link from 'next/link';
import Image from 'next/image';
import { Experience } from '@/lib/database.types';

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <Link href={`/experience/${experience.id}`}>
      <div className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover"
          />
          {experience.guide_name && (
            <div className="absolute bottom-3 left-3 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              {experience.guide_name}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{experience.title}</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {experience.location}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {experience.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600">From </span>
              <span className="font-bold text-lg">₹{experience.price}</span>
            </div>
            <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-1.5 rounded text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
