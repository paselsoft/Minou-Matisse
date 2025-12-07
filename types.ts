// Convex ritorna "_id" invece di "id".
// Per semplicità nel frontend, adatteremo l'interfaccia.
export interface Cat {
  _id: string; 
  name: string;
  breed: string;
  age: number; 
  weight: number; 
  imageUrl: string;
  gender: 'Maschio' | 'Femmina' | string;
}

export interface CareLog {
  _id: string;
  catId: string;
  type: LogType | string;
  timestamp: string; 
  notes: string;
  value?: string | number;
}

export enum LogType {
  FEEDING = 'Alimentazione',
  LITTER = 'Lettiera',
  WEIGHT = 'Peso',
  MEDICAL = 'Medico',
  GROOMING = 'Toelettatura',
  OTHER = 'Altro'
}

export interface AiAdvice {
  text: string;
  timestamp: string;
}