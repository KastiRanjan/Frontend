declare module 'nepali-date' {
  export default class NepaliDate {
    constructor(date?: Date | number | string);
    constructor(year: number, month: number, date: number);
    
    getYear(): number;
    getMonth(): number; // 0-indexed
    getDate(): number;
    getDay(): number;
    
    setYear(year: number): void;
    setMonth(month: number): void; // 0-indexed
    setDate(date: number): void;
    
    format(format: string, locale?: string): string;
    toJSDate(): Date;
    
    static parse(dateString: string): NepaliDate;
    static now(): NepaliDate;
  }
}

declare module 'bikram-sambat' {
  export function toBS(date: Date): { year: number; month: number; date: number };
  export function toAD(year: number, month: number, date: number): Date;
}
