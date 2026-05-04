import type { PI, TimelineRow } from "@/types/content";
import { asset } from "@/lib/asset";

export const pi: PI = {
  name: "Bilin Zhuang",
  title: "Assistant Professor of Chemistry",
  affiliation: "Harvey Mudd College",
  email: "bzhuang@g.hmc.edu",
  cvUrl: asset("/bilin_zhuang_cv_2024jun.pdf"),
  tagline:
    "Soft-matter chemical physics — statistical thermodynamics and field-theoretic approaches to liquids, solutions, polyelectrolyte brushes, and phase separation, with undergraduates at Harvey Mudd College.",
  bio: [
    "Bilin Zhuang works at the intersection of statistical thermodynamics and chemical physics, building field-theoretic and analytical theories that explain the structure, correlations, and phase behavior of polar liquids, electrolytes, polyelectrolyte brushes, and other soft-matter systems.",
    "She is an Assistant Professor in the Department of Chemistry at Harvey Mudd College, where she leads the Zhuang Group. She joined HMC in 2023 after three years on the faculty of Yale-NUS College in Singapore, and a parallel appointment as a Scientist at the Institute of High Performance Computing (A*STAR), Singapore.",
    "Her group develops first-principle theories of dipolar and polarizable liquids, mathematical descriptors of water structure, unified theories for polyelectrolyte brushes in salt solutions, and models of liquid–liquid phase separation. Recent work appears in Science Advances, JACS, J. Phys. Chem. Lett., and Macromolecules.",
    "She earned her Ph.D. in Chemistry from the California Institute of Technology in 2016 under Professor Zhen-Gang Wang, with a dissertation on dipolar liquids and their mixtures using field-theoretic approaches. She holds a B.A. in Physics and Chemistry from Wellesley College (2009), where she was awarded the APS Leroy Apker Award.",
  ],
  portrait: asset("/images/bilin.jpg"),
};

export const affiliations: TimelineRow[] = [
  {
    year: "2023–",
    title: "Assistant Professor of Chemistry",
    org: "Harvey Mudd College, Claremont, CA, USA",
  },
  {
    year: "2020–2023",
    title: "Assistant Professor of Chemistry",
    org: "Yale-NUS College, Singapore",
  },
  {
    year: "2017–2022",
    title: "Scientist (joint appointment from 2020)",
    org: "Institute of High Performance Computing, A*STAR, Singapore",
  },
  {
    year: "2010–2016",
    title: "Ph.D. in Chemistry",
    org: "California Institute of Technology — advisor: Prof. Zhen-Gang Wang",
  },
  {
    year: "2006–2009",
    title: "B.A. in Physics and Chemistry",
    org: "Wellesley College, Massachusetts, USA",
  },
];

export const awards: TimelineRow[] = [
  {
    year: "2023",
    title: "NSF CAREER Award",
    org: "National Science Foundation, USA",
  },
  {
    year: "2022",
    title: "Yale-NUS Teaching Enhancement Grant",
    org: "Yale-NUS College",
  },
  {
    year: "2020",
    title: "AME Young Individual Research Grant",
    org: "A*STAR, Singapore (Role: PI)",
  },
  {
    year: "2018",
    title: "SERC Career Development Award",
    org: "Science and Engineering Research Council, A*STAR (Role: PI)",
  },
  {
    year: "2009",
    title: "Leroy Apker Award",
    org: "American Physical Society",
  },
  {
    year: "2009",
    title: "Phyllis J. Fleming Prize for Distinction in Physics",
    org: "Wellesley College",
  },
  {
    year: "2009",
    title: "Jean V. Crawford Prize in Chemistry",
    org: "Wellesley College",
  },
  {
    year: "2006",
    title: "National Science Scholarship (BS–PhD)",
    org: "A*STAR, Singapore",
  },
];
