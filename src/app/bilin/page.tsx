import type { Metadata } from "next";
import { PIProfile } from "@/components/PIProfile";

export const metadata: Metadata = {
  title: "bilin-fluid",
  description:
    "Bilin Zhuang — Assistant Professor of Chemistry at Harvey Mudd College. Statistical thermodynamics and computational chemistry of soft matter.",
};

export default function BilinPage() {
  return (
    <div className="container-narrow py-8 lg:py-12">
      <PIProfile />
    </div>
  );
}
