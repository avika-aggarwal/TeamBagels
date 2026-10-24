// Offline stand-in for SerpAPI: generic research notes with real, stable reference sites.
export async function lookupMock({ name }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    summary: `Field guides agree that ${name} should be admired from a distance. Cross-check leaf, stem and habitat details with a regional expert before trusting any identification.`,
    sources: [
      { title: 'Poison Control — Poisonous Plants', link: 'https://www.poison.org/articles/plants' },
      { title: 'iNaturalist — community species records', link: 'https://www.inaturalist.org/' },
      { title: 'Texas Parks & Wildlife — Nature guides', link: 'https://tpwd.texas.gov/huntwild/wild/species/' },
    ],
    images: [],
  };
}
