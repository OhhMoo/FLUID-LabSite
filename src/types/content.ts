export type PI = {
  name: string;
  title: string;
  affiliation: string;
  email: string;
  cvUrl: string;
  bio: string[];
  tagline: string;
  portrait?: string;
};

export type TimelineRow = {
  year: string;
  title: string;
  org: string;
  note?: string;
};

/** An EDUCATION entry. Carries the two fields a CV records and an appointment doesn't. */
export type EducationRow = TimelineRow & {
  dissertation?: string;
  advisor?: string;
};

export type Thrust = {
  slug: string;
  title: string;
  summary: string;
  fullDescription: string[];
  keyPublicationDois: string[];
  image?: string;
  imageAlt?: string;
};

export type Publication = {
  id: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  volume?: string;
  pages?: string;
  doi: string;
  preprintUrl?: string;
  pdfUrl?: string;
  note?: string;
};

/** A conference or seminar talk. `invited` mirrors the CV's "(invited talk)" marker. */
export type Talk = {
  id: string;
  title: string;
  invited: boolean;
  venue: string;
  location: string;
  year: number;
};

/** A course taught. `terms` stays prose because the CV writes it that way. */
export type Course = {
  id: string;
  title: string;
  terms: string;
  institution: string;
  note?: string;
};

/** A supervised senior thesis. */
export type Thesis = {
  id: string;
  student: string;
  year: number;
  title: string;
  note?: string;
};

export type Person = {
  slug: string;
  name: string;
  role: string;
  classYear?: string;
  linkedIn?: string;
  photo?: string;
};

export type People = {
  postdoc: Person[];
  current: Person[];
  alumni: {
    staff: Person[];
    undergrad: Person[];
    highSchool: Person[];
  };
};

export type NewsPost = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  url: string;
};
