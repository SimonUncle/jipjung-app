export interface Cabin {
  number: string;
  deck: number;
  position: "port" | "starboard"; // 좌현/우현
}

// Generate cabin layout
// Deck 1: Cabins 101-108
// Deck 2: Cabins 201-208
// Deck 3: Cabins 301-308

function generateCabins(): Cabin[] {
  const cabins: Cabin[] = [];

  // Deck 1
  for (let i = 1; i <= 8; i++) {
    cabins.push({
      number: `1${i.toString().padStart(2, "0")}`,
      deck: 1,
      position: i % 2 === 1 ? "port" : "starboard",
    });
  }

  // Deck 2
  for (let i = 1; i <= 8; i++) {
    cabins.push({
      number: `2${i.toString().padStart(2, "0")}`,
      deck: 2,
      position: i % 2 === 1 ? "port" : "starboard",
    });
  }

  // Deck 3
  for (let i = 1; i <= 8; i++) {
    cabins.push({
      number: `3${i.toString().padStart(2, "0")}`,
      deck: 3,
      position: i % 2 === 1 ? "port" : "starboard",
    });
  }

  return cabins;
}

export const CABINS = generateCabins();

export function getCabinsByDeck(deck: number): Cabin[] {
  return CABINS.filter((c) => c.deck === deck);
}

export function getCabinByNumber(number: string): Cabin | undefined {
  return CABINS.find((c) => c.number === number);
}

export function getAllCabins(): Cabin[] {
  return CABINS;
}
