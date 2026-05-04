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
