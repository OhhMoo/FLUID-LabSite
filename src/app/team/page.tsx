import type { Metadata } from "next";
import { people } from "@/data/people";
import { pi } from "@/data/pi";
import { PeopleGroup } from "@/components/PeopleGroup";
import { PersonCard } from "@/components/PersonCard";
import { SectionNumber } from "@/components/SectionNumber";
import { Reveal } from "@/components/Reveal";
import type { Person } from "@/types/content";

export const metadata: Metadata = {
  title: "team-fluid",
  description:
    "Postdoctoral fellows, undergraduate researchers, and alumni of the Zhuang group at Harvey Mudd College.",
};

const piAsPerson: Person = {
  slug: "bilin-zhuang",
  name: pi.name,
  role: `${pi.title}, ${pi.affiliation}`,
};

export default function TeamPage() {
  return (
    <div className="container-wide flex flex-col gap-8 py-8">
      <Reveal as="article" className="surface-card p-6 sm:p-8">
        <header className="mb-10">
          <SectionNumber n={4} />
          <h1 className="section-h2 mt-3">team</h1>
          <p className="mt-4 max-w-2xl text-[color:var(--color-ink-2)]">
            The Zhuang group is built around undergraduate research at Harvey
            Mudd College, with postdoctoral fellows and visiting collaborators.
          </p>
        </header>

        <section className="pb-10">
          <h2 className="mb-6 font-mono text-xs uppercase tracking-wide text-[color:var(--color-accent)]">
            Principal Investigator
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            <PersonCard person={piAsPerson} />
          </div>
        </section>

        <PeopleGroup title="Postdoctoral Fellows" people={people.postdoc} />
        <PeopleGroup title="Current Undergraduates" people={people.current} />
      </Reveal>

      <Reveal as="article" className="surface-card p-6 sm:p-8">
        <h2 className="h2 mb-6">Alumni</h2>
        <PeopleGroup title="Staff Alumni" people={people.alumni.staff} compact />
        <PeopleGroup
          title="Undergraduate Alumni"
          people={people.alumni.undergrad}
          compact
        />
        <PeopleGroup
          title="High School Researchers"
          people={people.alumni.highSchool}
          compact
        />
      </Reveal>
    </div>
  );
}
