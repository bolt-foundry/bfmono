import { iso } from "@iso-bfc";

/**
 * BfDeck.DeckSamples - Fragment for querying detailed sample data for a specific deck
 *
 * This fragment is used when we need to display the full sample data for a deck,
 * typically in the deck detail view. It includes all the fields needed to transform
 * BfSample data into the GradingSample interface.
 */
export const DeckSamples = iso(`
  field BfDeck.DeckSamples @component {
    id
    name
    samples(first: 1000) {
      edges {
        node {
          SampleListItem
        }
      }
    }
  }
`)(function DeckSamples({ data }) {
  // This component doesn't render anything - it's just a data fragment
  // The actual rendering is done by components that use this data
  return null;
});
