import type { Course } from "@/types/content";

const HMC = "Harvey Mudd College";
const YNC = "Yale-NUS College";

/** Courses taught, newest first. Source: CV (June 2024), COURSES TAUGHT. */
export const courses: Course[] = [
  {
    id: "computations-in-chemistry",
    title: "Computations in Chemistry",
    terms: "Spring 2024",
    institution: HMC,
  },
  {
    id: "first-year-chemistry-lab",
    title: "First-year Chemistry Laboratory",
    terms: "Fall 2023, Spring 2024",
    institution: HMC,
  },
  {
    id: "chemistry-in-the-modern-world",
    title: "Chemistry in the Modern World",
    terms: "Fall 2023",
    institution: HMC,
  },
  {
    id: "science-of-everyday-cooking",
    title: "Science of Everyday Cooking",
    terms: "Fall 2022",
    institution: YNC,
    note: "New course, developed by Prof. Zhuang",
  },
  {
    id: "physical-sciences-research-seminar",
    title: "Physical Sciences Research Seminar",
    terms: "Fall 2022",
    institution: YNC,
  },
  {
    id: "mathematical-methods",
    title: "Mathematical Methods for Physical Sciences",
    terms: "Spring 2022",
    institution: YNC,
  },
  {
    id: "analytical-chemistry-lab",
    title: "Analytical Chemistry with Laboratory",
    terms: "Fall 2020, Fall 2022",
    institution: YNC,
    note: "New course, developed by Prof. Zhuang",
  },
  {
    id: "statistical-thermodynamics",
    title: "Statistical Thermodynamics",
    terms: "Spring 2021, Spring 2022",
    institution: YNC,
    note: "Redeveloped to serve both physics and chemistry majors",
  },
  {
    id: "culinary-art-science-bread",
    title: "The Culinary Art and Science of Everyday Bread",
    terms: "Spring 2021",
    institution: YNC,
    note: "One-week experiential learning program, developed by Prof. Zhuang",
  },
  {
    id: "scientific-inquiry-2",
    title: "Scientific Inquiry 2",
    terms: "Fall 2020",
    institution: YNC,
  },
];
