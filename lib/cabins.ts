import { CabinType } from "@/types";

export interface Cabin {
  number: string;
  deck: number;
  position: "port" | "starboard"; // 좌현/우현
  type: CabinType;
  isOceanView: boolean;
}

// Generate cabin layout
// Deck 1: Cabins 101-108 (Premium - Ocean View)
// Deck 2: Cabins 201-208 (Standard - Interior)
// Deck 3: Cabins 301-308 (Standard - Interior)

function generateCabins(): Cabin[] {
  const cabins: Cabin[] = [];

  // Deck 1 - Premium cabins (ocean view)
  for (let i = 1; i <= 8; i++) {
    cabins.push({
      number: `1${i.toString().padStart(2, "0")}`,
      deck: 1,
      position: i % 2 === 1 ? "port" : "starboard",
      type: "premium",
      isOceanView: true,
    });
  }

  // Deck 2 - Standard cabins (interior)
  for (let i = 1; i <= 8; i++) {
    cabins.push({
      number: `2${i.toString().padStart(2, "0")}`,
      deck: 2,
      position: i % 2 === 1 ? "port" : "starboard",
      type: "standard",
      isOceanView: false,
    });
  }

  // Deck 3 - Standard cabins (interior)
  for (let i = 1; i <= 8; i++) {
    cabins.push({
      number: `3${i.toString().padStart(2, "0")}`,
      deck: 3,
      position: i % 2 === 1 ? "port" : "starboard",
      type: "standard",
      isOceanView: false,
    });
  }

  return cabins;
}

export const CABINS = generateCabins();

export function getCabinsByType(type: CabinType): Cabin[] {
  return CABINS.filter((c) => c.type === type);
}

export function getCabinsByDeck(deck: number): Cabin[] {
  return CABINS.filter((c) => c.deck === deck);
}

export function getCabinByNumber(number: string): Cabin | undefined {
  return CABINS.find((c) => c.number === number);
}

export function getAvailableCabins(type: CabinType): Cabin[] {
  // For now, all cabins are available
  // In a real app, this would check against booked cabins
  return getCabinsByType(type);
}

// Get cabin layout for grid display
export function getCabinGrid(type: CabinType): Cabin[][] {
  const cabins = getCabinsByType(type);
  const rows: Cabin[][] = [];

  // Group by deck
  const decks = [...new Set(cabins.map((c) => c.deck))];

  for (const deck of decks) {
    const deckCabins = cabins.filter((c) => c.deck === deck);
    // Split into rows of 4
    for (let i = 0; i < deckCabins.length; i += 4) {
      rows.push(deckCabins.slice(i, i + 4));
    }
  }

  return rows;
}
