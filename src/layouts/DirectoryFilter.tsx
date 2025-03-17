import React, { useState, useEffect } from "react";
import { humanize, slugify } from "@/lib/utils/textConverter";
import DirectoryItem from "@/components/DirectoryItem";
import type { ImageMetadata } from 'astro';

export type DirectoryItem = {
  slug: string;
  data: {
    title: string;
    description?: string;
    image?: string | ImageMetadata;  // Updated to support both string URLs and ImageMetadata
    logo?: string | ImageMetadata;    // Updated to support both string URLs and ImageMetadata
    category: string[];
    location: string[];
    featured?: boolean;
    website?: string;
  };
};

interface Props {
  directoryItems: DirectoryItem[];
  categories: string[];
}

const DirectoryFilter = ({ directoryItems, categories }: Props) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");
  const [filteredItems, setFilteredItems] = useState<DirectoryItem[]>([]);
  
  // Get all unique locations
  const allLocations = [
    ...new Set(
      directoryItems.flatMap((item) => item.data.location)
    ),
  ].sort();

  // Read URL parameters on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get("category");
      const locationParam = params.get("location");
      
      // Set active filters based on URL parameters
      if (categoryParam) {
        const matchedCategory = categories.find(
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
    if (typeof window !== "undefined") {
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

  // Filter items when category or location changes
  useEffect(() => {
    let filtered = directoryItems;
    
    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((item) =>
        item.data.category.map(cat => slugify(cat)).includes(slugify(activeCategory))
      );
    }
    
    // Apply location filter
    if (activeLocation !== "all") {
      filtered = filtered.filter((item) =>
        item.data.location.map(loc => slugify(loc)).includes(slugify(activeLocation))
      );
    }
    
    setFilteredItems(filtered);
  }, [activeCategory, activeLocation, directoryItems]);

  return (
    <div className="section">
      {/* Filter Controls */}
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
            
            {categories.map((category) => (
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

      {/* Results Count */}
      <div className="my-6 text-center">
        <p>
          Showing {filteredItems.length} {filteredItems.length === 1 ? "vendor" : "vendors"}
          {activeCategory !== "all" && ` in ${humanize(activeCategory)}`}
          {activeLocation !== "all" && ` from ${humanize(activeLocation)}`}
        </p>
      </div>

      {/* Directory Items Grid */}
      <div className="row">
        {filteredItems.map((item) => (
          <DirectoryItem key={item.slug} item={item} />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-10">
          <p>No vendors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default DirectoryFilter;