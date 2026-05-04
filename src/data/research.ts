import type { Thrust } from "@/types/content";
import { asset } from "@/lib/asset";

export const research: Thrust[] = [
  {
    slug: "polar-liquids-field-theory",
    title: "Statistical Field Theory for Polar and Polarizable Liquids",
    summary:
      "Field-theoretic approaches to the complex correlations of polar and polarizable liquids — derivations are tedious, but the resulting expressions are often simple.",
    fullDescription: [
      "We use statistical field techniques to develop theories that can account for the complex correlations in polar and polarizable liquids. While the derivation is tedious, the resulting analytical expression is often simple.",
      "Two key results from this thrust: a more accurate expression for the liquid dielectric constant, and a quantitative description of the like-dissolves-like principle for predicting liquid miscibility.",
    ],
    keyPublicationDois: [
      "10.1126/sciadv.abe7275",
      "10.1063/1.5046511",
    ],
    image: asset("/images/research/polar-liquids.webp"),
    imageAlt:
      "Schematic of a Na+ cation surrounded by oriented solvent dipoles in concentric shells.",
  },
  {
    slug: "water-structure",
    title: "Understanding Water Structure",
    summary:
      "Water exhibits unusual properties — including a density maximum at 4 °C — and may behave as a mixture of distinct structural arrangements. We develop tools to identify these phases.",
    fullDescription: [
      "Water exhibits unusual properties compared to typical liquids — most famously a maximum density at 4 °C rather than continuous expansion upon heating. We explore whether water behaves as a mixture of distinct structural arrangements, and develop mathematical measures that identify these two phases.",
      "Together with experimental collaborators, we have decoded a percolation-like phase transition in water near 330 K using upconverting-nanoparticle thermometry as a structural ruler.",
    ],
    keyPublicationDois: [
      "10.1021/acs.jpclett.0c02147",
      "10.1021/acs.jpclett.4c00044",
    ],
    image: asset("/images/research/water-structure.png"),
    imageAlt:
      "Tetrahedral arrangement of four water molecules connected by hydrogen bonds.",
  },
  {
    slug: "polyelectrolyte-brushes",
    title: "Polyelectrolyte Brushes in Salt Solutions",
    summary:
      "How does ion valency control polyelectrolyte brush conformations? These brushes underpin adhesives, lubricants, and superhydrophobic coatings.",
    fullDescription: [
      "Polyelectrolyte brushes — dense layers of charged polymers grafted to a surface — change conformation dramatically with the ionic environment. We build unified theories for how solvent quality and ion valency together set brush morphology.",
      "Recent work covers zwitterionic peptide brush sequence-structure relationships, ion-adsorption-driven nonelectrostatic attractions, and synergistic regulation by solvent quality and trivalent ions.",
    ],
    keyPublicationDois: [
      "10.1016/j.giant.2025.100363",
      "10.1021/acs.macromol.2c01464",
      "10.1021/acs.macromol.1c01229",
    ],
    image: asset("/images/research/polyelectrolyte-brushes.png"),
    imageAlt:
      "Polyelectrolyte brush with counterions and a plot of brush height versus salt concentration for +1, +2, +3 ion valencies.",
  },
  {
    slug: "liquid-liquid-phase-separation",
    title: "Liquid-Liquid Phase Separation",
    summary:
      "Spontaneous droplet formation in cellular environments and confined geometries — with applications to active-ingredient encapsulation and biomolecular condensates.",
    fullDescription: [
      "Liquid-liquid phase separation underlies the formation of biomolecular condensates in cells and provides a route to encapsulate active ingredients in soft materials. We study how electrostatics, confinement, and copolymer architecture drive demixing.",
      "Outputs from this thrust include a salt-induced LLPS theory and a thesis-level study of LLPS in confined geometry under an electric field.",
    ],
    keyPublicationDois: [
      "10.1021/jacs.0c09420",
    ],
    image: asset("/images/research/llps.png"),
    imageAlt:
      "Liquid–liquid phase-separated droplet containing polymer chains and counterions.",
  },
];
