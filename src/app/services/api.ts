import axios from "axios";

export const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
});

export const fetchPokemons = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get(`/pokemon?limit=${limit}&offset=${offset}`);
    return response.data.results;
  } catch (error) {
    console.log("Erro a buscar os pokemons" + error);
    return [];
  }
};

export const fetchPokemonsByName = async (name: string) => {
  try {
    const response = await api.get(`/pokemon/${name}`);
    return response.data;
  } catch (error) {
    console.log("Erro a buscar este pokemon" + error);
    return [];
  }
};
