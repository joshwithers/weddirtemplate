import React, { useState, useEffect } from "react";
import { humanize, slugify } from "@/lib/utils/textConverter";
import DirectoryItem from "@/components/DirectoryItem";
import type { ImageMetadata } from 'astro';

export type DirectoryItemType = {
  slug: string;
  data: {
    title: string;
    description?: string;
    image?: string | ImageMetadata;
    logo?: string | ImageMetadata;
    category: string[];
    location: string[];
    featured?: boolean;
    website?: string;
    date?: string; // For date-based sorting
  };
};

interface DirectoryListingsProps {
  items: DirectoryItemType[];
  sortBy?: 'alphabetical' | 'date' | 'random';
  featuredOnly?: boolean;
  showFilters?: boolean;
  title?: string;
  maxItems?: number;
}

const DirectoryListings: React.FC<DirectoryListingsProps> = ({
  items,
  sortBy = 'alphabetical',
  featuredOnly = false,
  showFilters = true,
  title,
  maxItems
}) => {
  // Ensure all items have a slug
  const itemsWithSlugs = items.map(item => {
    if (!item.slug) {
      // If no slug exists, create one from the title
      const newItem = {...item};
      newItem.slug = slugify(item.data.title);
      console.log(`Created slug for ${item.data.title}: ${newItem.slug}`);
      return newItem;
    }
    return item;
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");
  const [filteredItems, setFilteredItems] = useState<DirectoryItemType[]>([]);
  const [sortedItems, setSortedItems] = useState<DirectoryItemType[]>([]);
  
  // Get all unique categories
  const allCategories = [
    ...new Set(
      itemsWithSlugs.flatMap((item) => item.data.category)
    ),
  ].sort();
  
  // Get all unique locations
  const allLocations = [
    ...new Set(
      itemsWithSlugs.flatMap((item) => item.data.location)
    ),
  ].sort();

  // Read URL parameters on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && showFilters) {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get("category");
      const locationParam = params.get("location");
      
      // Set active filters based on URL parameters
      if (categoryParam) {
        const matchedCategory = allCategories.find(
          cat => slugify(cat) === categoryParam
        );
        if (matchedCategory) {
          setActiveCategory(matchedCategory);
        }
      }
      
      if (locationParam) {
        const matchedLocation = allLocations.find(
          loc => slugify(loc) === locationParam
        );
        if (matchedLocation) {
          setActiveLocation(matchedLocation);
        }
      }
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== "undefined" && showFilters) {
      const params = new URLSearchParams();
      
      if (activeCategory !== "all") {
        params.set("category", slugify(activeCategory));
      }
      
      if (activeLocation !== "all") {
        params.set("location", slugify(activeLocation));
      }
      
      const newUrl = 
        params.toString() 
          ? `${window.location.pathname}?${params.toString()}` 
          : window.location.pathname;
      
      window.history.replaceState({}, "", newUrl);
    }
  }, [activeCategory, activeLocation]);

  // Apply initial filtering and sorting
  useEffect(() => {
    // First filter by featured if needed
    let result = featuredOnly 
      ? itemsWithSlugs.filter(item => item.data.featured) 
      : itemsWithSlugs;
    
    // Apply category filter
    if (activeCategory !== "all") {
      result = result.filter((item) =>
        item.data.category.map(cat => slugify(cat)).includes(slugify(activeCategory))
      );
    }
    
    // Apply location filter
    if (activeLocation !== "all") {
      result = result.filter((item) =>
        item.data.location.map(loc => slugify(loc)).includes(slugify(activeLocation))
      );
    }
    
    // Apply sorting
    let sorted = [...result];
    
    switch (sortBy) {
      case 'alphabetical':
        sorted.sort((a, b) => a.data.title.localeCompare(b.data.title));
        break;
      case 'date':
        sorted.sort((a, b) => {
          if (!a.data.date) return 1;
          if (!b.data.date) return -1;
          return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
        });
        break;
      case 'random':
        // Fisher-Yates shuffle algorithm
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
        break;
    }
    
    // Apply max items limit if specified
    if (maxItems && maxItems > 0) {
      sorted = sorted.slice(0, maxItems);
    }
    
    setFilteredItems(result);
    setSortedItems(sorted);
  }, [itemsWithSlugs, activeCategory, activeLocation, featuredOnly, sortBy, maxItems]);

  return (
    <div className="directory-listings">
      {title && <h1 className="text-center mb-8">{title}</h1>}
      
      {/* Filters - only show if showFilters is true */}
      {showFilters && (
        <div className="mb-8">
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-center">
              <button
                className={`m-1 rounded px-3 py-1 text-sm ${
                  activeCategory === "all"
                    ? "bg-primary text-white"
                    : "bg-theme-light text-dark"
                }`}
                onClick={() => setActiveCategory("all")}
              >
                All Categories
              </button>
              
              {allCategories.map((category) => (
                <button
                  key={category}
                  className={`m-1 rounded px-3 py-1 text-sm ${
                    activeCategory === category
                      ? "bg-primary text-white"
                      : "bg-theme-light text-dark"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {humanize(category)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Location Filter */}
          <div>
            <div className="flex flex-wrap items-center justify-center">
              <button
                className={`m-1 rounded px-3 py-1 text-sm ${
                  activeLocation === "all"
                    ? "bg-primary text-white"
                    : "bg-theme-light text-dark"
                }`}
                onClick={() => setActiveLocation("all")}
              >
                All Locations
              </button>
              
              {allLocations.map((location) => (
                <button
                  key={location}
                  className={`m-1 rounded px-3 py-1 text-sm ${
                    activeLocation === location
                      ? "bg-primary text-white"
                      : "bg-theme-light text-dark"
                  }`}
                  onClick={() => setActiveLocation(location)}
                >
                  {humanize(location)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Count - only show if showFilters is true */}
      {showFilters && (
        <div className="my-6 text-center">
          <p>
            Showing {sortedItems.length} {sortedItems.length === 1 ? "vendor" : "vendors"}
            {activeCategory !== "all" && ` in ${humanize(activeCategory)}`}
            {activeLocation !== "all" && ` from ${humanize(activeLocation)}`}
            {featuredOnly && " (featured only)"}
          </p>
        </div>
      )}

      {/* Directory Items Grid */}
      <div className="row">
        {sortedItems.map((item) => (
          <DirectoryItem key={item.slug} item={item} />
        ))}
      </div>
      
      {sortedItems.length === 0 && (
        <div className="text-center py-10">
          <p>No vendors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default DirectoryListings;