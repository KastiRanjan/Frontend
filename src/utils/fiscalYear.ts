const NEPALI_YEAR_OFFSET = 57;

export const getCurrentNepaliFiscalYear = (): number => {
  const today = new Date();
  return today.getFullYear() + NEPALI_YEAR_OFFSET;
};

export const formatNepaliFiscalYear = (fiscalYear?: number | null): string => {
  if (!fiscalYear) return "-";

  return `${fiscalYear}/${(fiscalYear + 1).toString().slice(-2)}`;
};

export const getNepaliFiscalYearOptions = (yearsToShow = 20) => {
  const currentFiscalYear = getCurrentNepaliFiscalYear();

  return Array.from({ length: yearsToShow }, (_, index) => {
    const startYear = currentFiscalYear - index;

    return {
      value: startYear,
      label: formatNepaliFiscalYear(startYear)
    };
  });
};