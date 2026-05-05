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
    "Postdoctoral fellows, undergraduate researchers, and alumni of the FLUID Lab at Harvey Mudd College.",
};

const piAsPerson: Person = {
  slug: "bilin-zhuang",
  name: pi.name,
  role: `${pi.title}, ${pi.affiliation}`,
};

export default function TeamPage() {
  return (
    <div className="container-narrow py-10 lg:py-16">
      <header className="mb-12 lg:mb-16">
        <SectionNumber n={4} />
        <h1 className="display mt-5">team</h1>
        <p className="mt-5 max-w-[60ch] prose-body">
          Built around undergraduate research at Harvey Mudd College, with
          postdoctoral fellows and visiting collaborators.
        </p>
      </header>

      <Reveal variant="up">
        <section>
          <h2 className="eyebrow mb-6">Principal Investigator</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            <PersonCard person={piAsPerson} />
          </div>
        </section>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <PeopleGroup title="Postdoctoral Fellows" people={people.postdoc} />
      </Reveal>

      <Reveal variant="up" delay={160}>
        <PeopleGroup
          title="Current Undergraduates"
          people={people.current}
        />
      </Reveal>

      <Reveal variant="up" delay={80} className="mt-12 lg:mt-16">
        <h2 className="h2 mb-2">Alumni</h2>
        <p
          className="mb-6 small"
          style={{ color: "var(--color-ink-3)" }}
        >
          Where the lab’s past collaborators are now.
        </p>
        <PeopleGroup
          title="Staff Alumni"
          people={people.alumni.staff}
          compact
        />
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
