import { useEffect, useState } from "react";
import { fetchBusinessSizes } from "@/service/businessSize.service";
import { fetchBusinessNatures } from "@/service/businessNature.service";
import { fetchLegalStatuses } from "@/service/legalStatus.service";

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

interface LegalStatusOption {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

export const useBusinessOptions = () => {
  const [businessSizes, setBusinessSizes] = useState<BusinessSizeOption[]>([]);
  const [businessNatures, setBusinessNatures] = useState<BusinessNatureOption[]>([]);
  const [legalStatuses, setLegalStatuses] = useState<LegalStatusOption[]>([]);
  const [loading, setLoading] = useState({
    businessSizes: false,
    businessNatures: false,
    legalStatuses: false,
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

      try {
        setLoading(prev => ({ ...prev, legalStatuses: true }));
        const statuses = await fetchLegalStatuses();
        setLegalStatuses(statuses);
      } catch (error) {
        console.error("Error fetching legal statuses:", error);
      } finally {
        setLoading(prev => ({ ...prev, legalStatuses: false }));
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

  const legalStatusOptions = legalStatuses.map(status => ({
    value: status.id,
    label: status.name,
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

  const legalStatusEnumOptions = [
    { value: "private_limited", label: "Private Limited" },
    { value: "public_limited", label: "Public Limited" },
    { value: "partnership", label: "Partnership" },
    { value: "proprietorship", label: "Proprietorship" },
    { value: "natural_person", label: "Natural Person" },
    { value: "i_ngo", label: "I NGO" },
    { value: "cooperative", label: "Cooperative" },
    { value: "government_soe", label: "Government SOE" },
    { value: "others", label: "Others" },
  ];

  return {
    businessSizeOptions,
    businessNatureOptions,
    legalStatusOptions,
    businessSizeEnumOptions,
    businessNatureEnumOptions,
    legalStatusEnumOptions,
    loading,
  };
};
