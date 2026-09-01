import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedProperties } from '../components/home/FeaturedProperties';
import { FeaturedProjects } from '../components/home/FeaturedProjects';
import { ServicesSection } from '../components/home/ServicesSection';
import { StatsSection } from '../components/home/StatsSection';
import { CTASection } from '../components/home/CTASection';
import { Property, Project, PropertyFilterParams } from '../types';
import { SEOHead } from '../components/common/SEOHead';

interface HomePageProps {
  properties: Property[];
  projects: Project[];
  loadingProperties?: boolean;
  onNavigate: (path: string) => void;
  onSearch: (params: PropertyFilterParams) => void;
  onOpenConsultation: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  properties,
  projects,
  loadingProperties = false,
  onNavigate,
  onSearch,
  onOpenConsultation,
}) => {
  return (
    <div className="space-y-0">
      <SEOHead
        canonicalPath="/"
        breadcrumbs={[{ name: 'Trang chủ', path: '/' }]}
      />
      <HeroSection
        onSearch={onSearch}
        onOpenConsultation={onOpenConsultation}
        onNavigate={onNavigate}
      />
      <FeaturedProperties
        properties={properties}
        loading={loadingProperties}
        onNavigate={onNavigate}
      />
      <FeaturedProjects
        projects={projects}
        onNavigate={onNavigate}
      />
      <ServicesSection />
      <StatsSection />
      <CTASection onOpenConsultation={onOpenConsultation} />
    </div>
  );
};
