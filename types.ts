export enum LogType {
  FEEDING = 'Alimentazione',
  LITTER = 'Lettiera',
  WEIGHT = 'Peso',
  MEDICAL = 'Medico',
  GROOMING = 'Toelettatura',
  OTHER = 'Altro'
}

export interface Cat {
  id: string;
  name: string;
  breed: string;
  age: number; // in months or years represented loosely
  weight: number; // in kg
  imageUrl: string;
  gender: 'Maschio' | 'Femmina';
}

export interface CareLog {
  id: string;
  catId: string;
  type: LogType;
  timestamp: string; // ISO string
  notes: string;
  value?: string | number; // e.g., weight amount, food type
}

export interface AiAdvice {
  text: string;
  timestamp: string;
}
