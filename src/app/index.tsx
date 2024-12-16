import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CaretRight, Gear, MagnifyingGlass } from "phosphor-react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { fetchPokemons, fetchPokemonsByName } from "./services/api";
import { PokemonListItem } from "../types/pokemon";

export default function Index() {
  const [search, setSearch] = useState("");
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPokemons = async () => {
      const data = await fetchPokemons();
      console.log(data);
      const fetchPokemonsWithPhotos: PokemonListItem[] = await Promise.all(
        data.map(async (item: { name: string; url: string }) => {
          const response = await fetch(item.url);
          const details = await response.json();
          return {
            name: item.name,
            image: details.sprites.front_default,
          };
        })
      );

      setPokemon(fetchPokemonsWithPhotos);
      setLoading(false);
    };

    loadPokemons();
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>Pokédex</Text>
        <Gear size={32} color="#FFF" />
      </View>

      <Text style={styles.info}>
        Encontre seu pokemon pesquisando pelo nome ou por seu Código Pokédex.
      </Text>

      <View style={styles.inputContainer}>
        <MagnifyingGlass size={25} color="#FFF" />
        <TextInput
          style={styles.input}
          placeholder="Pesquisar"
          placeholderTextColor="#FFF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.contentTitle}>Todos os pokemons</Text>

        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.name}
          data={pokemon}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardInfoLeft}>
                <Image
                  style={{ width: 80, height: 50 }}
                  source={{ uri: item.image }}
                />
                <View>
                  <Text>#{index + 1}</Text>
                  <Text>{item.name}</Text>
                </View>
              </View>

              <CaretRight size={32} />
            </View>
          )}
        />
      </View>

      <View style={styles.footer}>
        <Pressable
          disabled={search ? false : true}
          onPress={() => console.log("Oi")}
          style={[
            styles.footerButton,
            search ? "" : { backgroundColor: "#DADADA" },
          ]}
        >
          <Text style={styles.footerButtonText}>Conhecer um pokemon</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF8575",
  },
  header: {
    paddingTop: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 15,
    paddingHorizontal: 30,
  },
  logo: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  info: {
    color: "#FFF",
    fontSize: 19,
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 15,
    backgroundColor: "#F98E80",
    paddingVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    marginHorizontal: 30,
    marginVertical: 15,
  },
  input: {
    flex: 1,
    color: "#FFF",
  },
  content: {
    backgroundColor: "#FFF",
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  contentTitle: {
    color: "#000000",
    fontSize: 20,
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: 15,
    justifyContent: "space-between",
    borderRadius: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  cardInfoLeft: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  footer: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButton: {
    backgroundColor: "#F7776A",
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 4,
  },
  footerButtonText: {
    color: "#FFF",
  },
});
