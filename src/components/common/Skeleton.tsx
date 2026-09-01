import React from 'react';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111111] border border-[#D4AF37]/10 rounded-[20px] overflow-hidden animate-pulse flex flex-col h-full">
      {/* 4:3 Aspect ratio skeleton */}
      <div className="aspect-[4/3] bg-[#1a1a1a] w-full relative">
        <div className="absolute top-3.5 left-3.5 h-6 w-24 bg-[#26231c] rounded-full" />
        <div className="absolute top-3.5 right-3.5 h-8 w-8 bg-[#26231c] rounded-full" />
        <div className="absolute bottom-3 left-3.5 h-4 w-16 bg-[#26231c] rounded" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="h-3.5 bg-[#26231c] rounded w-2/5" />
          <div className="h-5 bg-[#26231c] rounded w-11/12" />
          <div className="h-5 bg-[#26231c] rounded w-3/4" />
        </div>
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/5">
          <div className="h-4 bg-[#26231c] rounded w-3/4" />
          <div className="h-4 bg-[#26231c] rounded w-3/4" />
          <div className="h-4 bg-[#26231c] rounded w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 bg-[#26231c] rounded w-1/3" />
          <div className="h-4 bg-[#26231c] rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111111] border border-[#D4AF37]/10 rounded-[24px] overflow-hidden animate-pulse flex flex-col h-full">
      <div className="aspect-[16/9] bg-[#1a1a1a] w-full relative">
        <div className="absolute top-4 left-4 h-6 w-28 bg-[#26231c] rounded-full" />
      </div>
      <div className="p-6 space-y-3 flex-1">
        <div className="h-3.5 bg-[#26231c] rounded w-1/3" />
        <div className="h-6 bg-[#26231c] rounded w-4/5" />
        <div className="h-4 bg-[#26231c] rounded w-full" />
        <div className="h-4 bg-[#26231c] rounded w-2/3" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 6 }) => {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-[#1f1d18] rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] p-5 sm:p-6 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3.5 bg-[#26231c] rounded w-1/3" />
        <div className="w-10 h-10 rounded-xl bg-[#26231c]" />
      </div>
      <div className="h-8 bg-[#26231c] rounded w-1/2" />
      <div className="h-3 bg-[#26231c] rounded w-3/4" />
    </div>
  );
};

export const ReservationCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-[#26231c] rounded w-1/3" />
        <div className="h-6 bg-[#26231c] rounded-full w-28" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-[#26231c] rounded w-3/4" />
        <div className="h-4 bg-[#26231c] rounded w-1/2" />
      </div>
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="h-5 bg-[#26231c] rounded w-1/4" />
        <div className="h-8 bg-[#26231c] rounded-xl w-24" />
      </div>
    </div>
  );
};

export const FormFieldSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3.5 bg-[#26231c] rounded w-1/4" />
      <div className="h-11 bg-[#1a1a1a] rounded-xl w-full border border-white/5" />
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 animate-pulse space-y-4">
      <div className="h-5 bg-[#26231c] rounded w-1/4" />
      <div className="h-64 bg-[#1a1a1a] rounded-xl w-full flex items-end justify-between p-4 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#26231c] rounded-t w-full"
            style={{ height: `${20 + (i * 12) % 70}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse space-y-8">
      {/* Top breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[#26231c] rounded w-36" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-[#26231c] rounded-full" />
          <div className="h-8 w-24 bg-[#26231c] rounded-full" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <div className="h-6 bg-[#26231c] rounded w-32" />
        <div className="h-10 bg-[#26231c] rounded w-3/4" />
        <div className="h-4 bg-[#26231c] rounded w-1/2" />
      </div>

      {/* Gallery Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 h-[340px] md:h-[480px]">
        <div className="md:col-span-2 bg-[#1a1a1a] rounded-[24px] h-full" />
        <div className="hidden md:grid grid-cols-2 col-span-2 gap-3.5 h-full">
          <div className="bg-[#1a1a1a] rounded-[16px]" />
          <div className="bg-[#1a1a1a] rounded-[16px]" />
          <div className="bg-[#1a1a1a] rounded-[16px]" />
          <div className="bg-[#1a1a1a] rounded-[16px]" />
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-28 bg-[#111111] rounded-[20px] border border-white/5" />
          <div className="h-6 bg-[#26231c] rounded w-1/3" />
          <div className="h-40 bg-[#111111] rounded-[20px] border border-white/5" />
          <div className="h-48 bg-[#111111] rounded-[20px] border border-white/5" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111111] p-6 rounded-[24px] h-80 border border-[#D4AF37]/15" />
        </div>
      </div>
    </div>
  );
};
