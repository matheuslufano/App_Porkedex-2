export interface PokemonListItem {
  name: string;
  url: string;
  image: string;
}

export interface PokemonDetails {
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
}
