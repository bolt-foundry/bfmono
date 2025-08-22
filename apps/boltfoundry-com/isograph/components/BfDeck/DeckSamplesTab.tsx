import { iso } from "@iso-bfc";

export const DeckSamplesTab = iso(`
  field BfDeck.DeckSamplesTab @component {
    id
    name
    DeckSamplesList
  }
`)(function DeckSamplesTab({ data }) {
  // The DeckSamplesList component handles all the samples display logic
  // including loading states, empty states, and the samples list
  const SamplesList = data.DeckSamplesList;
  return <SamplesList />;
});
