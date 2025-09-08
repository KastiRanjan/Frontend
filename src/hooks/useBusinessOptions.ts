import { useEffect, useState } from "react";
import { fetchBusinessSizes } from "@/service/businessSize.service";
import { fetchBusinessNatures } from "@/service/businessNature.service";

interface BusinessSizeOption {
  id: string;
  name: string;
  shortName: string;
  isActive?: boolean;
}

interface BusinessNatureOption {
  id: string;
  name: string;
  shortName: string;
  isActive?: boolean;
}

export const useBusinessOptions = () => {
  const [businessSizes, setBusinessSizes] = useState<BusinessSizeOption[]>([]);
  const [businessNatures, setBusinessNatures] = useState<BusinessNatureOption[]>([]);
  const [loading, setLoading] = useState({
    businessSizes: false,
    businessNatures: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, businessSizes: true }));
        const sizes = await fetchBusinessSizes();
        setBusinessSizes(sizes);
      } catch (error) {
        console.error("Error fetching business sizes:", error);
      } finally {
        setLoading(prev => ({ ...prev, businessSizes: false }));
      }
      
      try {
        setLoading(prev => ({ ...prev, businessNatures: true }));
        const natures = await fetchBusinessNatures();
        setBusinessNatures(natures);
      } catch (error) {
        console.error("Error fetching business natures:", error);
      } finally {
        setLoading(prev => ({ ...prev, businessNatures: false }));
      }
    };

    fetchData();
  }, []);

  // Format options for Select components
  const businessSizeOptions = businessSizes.map(size => ({
    value: size.id,
    label: size.name,
  }));

  const businessNatureOptions = businessNatures.map(nature => ({
    value: nature.id,
    label: nature.name,
  }));

  // Also provide enum options as fallback
  const businessSizeEnumOptions = [
    { value: "micro", label: "Micro" },
    { value: "cottage", label: "Cottage" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "not_applicable", label: "Not Applicable" },
  ];

  const businessNatureEnumOptions = [
    { value: "banking_finance", label: "Banking & Finance" },
    { value: "capital_market_broking", label: "Capital Market Broking" },
    { value: "insurance", label: "Insurance" },
    { value: "energy_mining_mineral", label: "Energy, Mining & Mineral" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "agriculture_forestry", label: "Agriculture & Forestry" },
    { value: "construction_real_estate", label: "Construction & Real Estate" },
    { value: "travel_tourism", label: "Travel & Tourism" },
    { value: "research_development", label: "Research & Development" },
    { value: "transportation_logistics_management", label: "Transportation & Logistics Management" },
    { value: "information_transmission_communication", label: "Information, Transmission & Communication" },
    { value: "aviation", label: "Aviation" },
    { value: "computer_electronics", label: "Computer & Electronics" },
    { value: "trading_of_goods", label: "Trading of Goods" },
    { value: "personal_service", label: "Personal Service" },
    { value: "business_related_service", label: "Business Related Service" },
    { value: "others", label: "Others" },
  ];

  return {
    businessSizeOptions,
    businessNatureOptions,
    businessSizeEnumOptions,
    businessNatureEnumOptions,
    loading,
  };
};
