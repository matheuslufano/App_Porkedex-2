import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { api } from "../services/api";

interface PropsParams {
  name?: string | null;
}

interface Evolution {
  name: string;
  image: string;
}

export default function Pokemon({ name }: PropsParams) {
  const [pokemon, setPokemon] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);

  useEffect(() => {
    if (name) {
      const loadPokemon = async () => {
        try {
          // Busca os detalhes do Pokémon
          const response = await api.get(`/pokemon/${name}`);
          const speciesUrl = response.data.species.url;

          // Adiciona GIF animado
          const mainPokemon = {
            ...response.data,
            animatedGif: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${response.data.id}.gif`,
          };

          setPokemon(mainPokemon);

          // Busca a URL da cadeia de evolução
          const speciesResponse = await api.get(speciesUrl);
          const evolutionChainUrl = speciesResponse.data.evolution_chain.url;

          // Busca a cadeia de evolução
          const evolutionResponse = await api.get(evolutionChainUrl);
          const evolutions = extractEvolutions(evolutionResponse.data.chain);

          // Carrega imagens para cada evolução
          const evolutionsWithImages = await Promise.all(
            evolutions.map(async (evoName) => {
              const evoResponse = await api.get(`/pokemon/${evoName}`);
              return {
                name: evoName,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${evoResponse.data.id}.gif`,
              };
            })
          );

          setEvolutions(evolutionsWithImages);
        } catch (error) {
          console.error("Erro ao buscar o Pokémon ou suas evoluções:", error);
        }
      };

      loadPokemon();
    }
  }, [name]);

  const extractEvolutions = (chain: any): string[] => {
    const evolutions: string[] = [];
    let current = chain;

    while (current) {
      evolutions.push(current.species.name);
      current = current.evolves_to[0]; // Pega a primeira evolução (não cobre todas as ramificações)
    }

    return evolutions;
  };

  if (!pokemon) {
    return <Text>Carregando informações do Pokémon...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: pokemon.animatedGif }}
          style={{ width: 150, height: 150 }}
        />
      </View>

      <Text style={styles.namePokemon}>{pokemon.name}</Text>

      <View style={styles.infoPokemon}>
        <View style={styles.infoCard}>
          <Text style={styles.textWeight}>{pokemon.weight / 10} kg</Text>
          <Text>Peso</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.textWeight}>{pokemon.height / 10} m</Text>
          <Text>Altura</Text>
        </View>
      </View>

      <Text style={styles.footerText}>Evoluções</Text>

      <View style={styles.cardContainer}>
        {evolutions.map((evo, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardBottom}>
              <Image
                source={{ uri: evo.image }}
                style={{ width: 80, height: 80 }}
              />
            </View>
            <Text style={{ textAlign: "center" }}>{evo.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFf",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    padding: "auto",
    elevation: 10,
    borderRadius: 6,
  },
  namePokemon: {
    marginVertical: 20,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoPokemon: {
    flexDirection: "row",
    gap: 20,
  },
  infoCard: {
    borderWidth: 1,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#F2F2F2",
  },
  textWeight: {
    fontSize: 20,
    fontWeight: "bold",
  },
  footerText: {
    marginVertical: 35,
    fontSize: 25,
    fontWeight: "semibold",
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  card: {
    marginBottom: 20,
    alignItems: "center",
  },
  cardBottom: {
    width: 100,
    height: 100,
    borderRadius: 4,
    backgroundColor: "#F6F6F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
});
