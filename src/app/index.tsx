import {
  Dimensions,
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
import { useEffect, useState } from "react";
import { fetchPokemons } from "./services/api";
import { PokemonListItem } from "../types/pokemon";
import Modal from "react-native-modal";
import Pokemon from "./pokemon/[name]";

const { height } = Dimensions.get("window");

export default function Index() {
  const [search, setSearch] = useState("");
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isToggleModal, setIsToggleModal] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  const toggleModal = (pokemonName?: string) => {
    if (pokemonName) {
      setSelectedPokemon(pokemonName); // Armazena o Pokémon selecionado
    }
    setIsToggleModal(!isToggleModal);
  };

  useEffect(() => {
    const loadPokemons = async () => {
      const data = await fetchPokemons();
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
        Encontre seu pokemon pesquisando aqui.
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
        data={pokemon.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => toggleModal(item.name)}>
            <View style={styles.card}>
              <View style={styles.cardInfoLeft}>
                <Image
                  style={{ width: 100, height: 100 }}
                  source={{ uri: item.image }}
                />
                <View>
                  <Text>#{index + 1}</Text>
                  <Text>{item.name}</Text>
                </View>
              </View>
              <CaretRight size={32} />
            </View>
          </Pressable>
        )}
      />
      </View>

      <View style={styles.footer}>
      <Pressable
        disabled={!search}
        onPress={async () => {
          const found = pokemon.find(p =>
            p.name.toLowerCase() === search.toLowerCase()
          );

          if (found) {
            toggleModal(found.name);
          } else {
            try {
              // Faz requisição direta à API
              const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`);
              if (!response.ok) throw new Error("Pokémon não encontrado");
              const data = await response.json();

              // Abre o modal com o nome do Pokémon buscado
              toggleModal(data.name);
            } catch (err) {
              alert("Pokémon não encontrado.");
            }
          }
        }}
        style={[
          styles.footerButton,
          !search && { backgroundColor: "#DADADA" },
        ]}
      >
        <Text style={styles.footerButtonText}>Conhecer um pokemon</Text>
      </Pressable>


      </View>

      <Modal
        isVisible={isToggleModal}
        onBackdropPress={() => toggleModal()}
        swipeDirection="down"
        onSwipeComplete={() => toggleModal()}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Pokemon name={selectedPokemon} />
        </View>
      </Modal>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f13921",
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
    backgroundColor: "#d78e8582",
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
    backgroundColor: "#eaeaea",
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
    padding: 20,
    justifyContent: "space-between",
    borderRadius: 5,
    marginBottom: 20,
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
  modal: {
    justifyContent: "flex-end", // Alinha o modal na parte inferior
    margin: 0, // Remove as margens padrão
  },
  modalContent: {
    height: height * 0.8, // Define a altura do modal (50% da tela)
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
});
