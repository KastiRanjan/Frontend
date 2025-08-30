import NepaliDate from 'nepali-date';
import dayjs, { Dayjs } from 'dayjs';

export interface DualDate {
  gregorian: Dayjs;
  nepali: NepaliDate;
  gregorianString: string;
  nepaliString: string;
}

export class DualDateConverter {
  
  /**
   * Convert a Gregorian date to Nepali date
   */
  static gregorianToNepali(date: Dayjs): NepaliDate {
    try {
      return new NepaliDate(date.toDate());
    } catch (error) {
      console.warn('Failed to convert Gregorian to Nepali date:', error);
      return new NepaliDate(); // Return current date as fallback
    }
  }

  /**
   * Convert a Nepali date to Gregorian date
   */
  static nepaliToGregorian(nepaliDate: NepaliDate): Dayjs {
    try {
      return dayjs(nepaliDate.toJSDate());
    } catch (error) {
      console.warn('Failed to convert Nepali to Gregorian date:', error);
      return dayjs(); // Return current date as fallback
    }
  }

  /**
   * Create a dual date object from a Gregorian date
   */
  static createDualDate(gregorianDate: Dayjs): DualDate {
    const nepaliDate = this.gregorianToNepali(gregorianDate);
    
    return {
      gregorian: gregorianDate,
      nepali: nepaliDate,
      gregorianString: gregorianDate.format('YYYY-MM-DD'),
      nepaliString: nepaliDate.format('YYYY-MM-DD', 'np')
    };
  }

  /**
   * Create a dual date object from a Nepali date
   */
  static createDualDateFromNepali(nepaliYear: number, nepaliMonth: number, nepaliDay: number): DualDate {
    const nepaliDate = new NepaliDate(nepaliYear, nepaliMonth - 1, nepaliDay); // Month is 0-indexed
    const gregorianDate = this.nepaliToGregorian(nepaliDate);
    
    return {
      gregorian: gregorianDate,
      nepali: nepaliDate,
      gregorianString: gregorianDate.format('YYYY-MM-DD'),
      nepaliString: nepaliDate.format('YYYY-MM-DD', 'np')
    };
  }

  /**
   * Format dual date for display
   */
  static formatDualDate(dualDate: DualDate, showBoth: boolean = true): string {
    if (!showBoth) {
      return dualDate.gregorianString;
    }
    
    const gregorianFormatted = dualDate.gregorian.format('MMM DD, YYYY');
    const nepaliFormatted = dualDate.nepali.format('MMMM DD, YYYY', 'np');
    
    return `${gregorianFormatted} (${nepaliFormatted})`;
  }

  /**
   * Get month names in both systems
   */
  static getMonthNames() {
    return {
      gregorian: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      nepali: [
        'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
        'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
      ],
      nepaliEn: [
        'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
        'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
      ]
    };
  }

  /**
   * Get day names in both systems
   */
  static getDayNames() {
    return {
      gregorian: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      nepali: ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'],
      nepaliEn: ['Aaitabar', 'Sombar', 'Mangalbar', 'Budhabar', 'Bihibar', 'Shukrabar', 'Shanibar']
    };
  }

  /**
   * Check if a date is a Nepali festival/holiday
   */
  static getNepaliEvents(nepaliDate: NepaliDate): string[] {
    try {
      const events: string[] = [];
      const month = nepaliDate.getMonth() + 1; // Convert to 1-indexed
      const day = nepaliDate.getDate();

      // Add major Nepali festivals (simplified list)
      const festivals = [
        { month: 1, day: 1, name: 'Naya Barsa (New Year)' },
        { month: 2, day: 15, name: 'Buddha Purnima' },
        { month: 3, day: 15, name: 'Janai Purnima' },
        { month: 4, day: 3, name: 'Gai Jatra' },
        { month: 5, day: 3, name: 'Teej (Haritalika)' },
        { month: 6, day: 15, name: 'Indra Jatra' },
        { month: 7, day: 1, name: 'Dashain Begins' },
        { month: 7, day: 10, name: 'Vijaya Dashami' },
        { month: 8, day: 1, name: 'Tihar Begins' },
        { month: 8, day: 3, name: 'Laxmi Puja' },
        { month: 8, day: 5, name: 'Bhai Tika' },
        { month: 9, day: 15, name: 'Holi (Fagu Purnima)' },
        { month: 10, day: 1, name: 'Chaite Dashain' }
      ];

      festivals.forEach(festival => {
        if (festival.month === month && festival.day === day) {
          events.push(festival.name);
        }
      });

      return events;
    } catch (error) {
      console.warn('Failed to get Nepali events:', error);
      return [];
    }
  }

  /**
   * Check if it's a weekend in Nepal (Saturday is holiday)
   */
  static isNepaliWeekend(gregorianDate: Dayjs): boolean {
    return gregorianDate.day() === 6; // Saturday
  }

  /**
   * Get today's date in dual format
   */
  static getToday(): DualDate {
    return this.createDualDate(dayjs());
  }
}

export default DualDateConverter;
