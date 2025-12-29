
export enum Gender {
  MUZ = 'MUZ',
  ZENA = 'ZENA',
  NEUTRALNI = 'NEUTRALNI'
}

export interface BabyName {
  gender: Gender;
  name: string;
  fact?: string;
}

export interface AppSettings {
  surname: string;
  gender: Gender;
}

export type View = 'discovery' | 'shortlist' | 'settings';
