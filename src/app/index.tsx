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
  Vibration,
} from "react-native";
import {
  CaretRight,
  MagnifyingGlass,
  Pause,
  Play,
} from "phosphor-react-native";
import { useEffect, useState } from "react";
import { fetchPokemons } from "./services/api";
import { PokemonListItem } from "../types/pokemon";
import Modal from "react-native-modal";
import Pokemon from "./pokemon/[name]";
import { Audio } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const [search, setSearch] = useState("");
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isToggleModal, setIsToggleModal] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleModal = (pokemonName?: string) => {
    if (pokemonName) {
      setSelectedPokemon(pokemonName);
    }
    setIsToggleModal(!isToggleModal);
  };

  // 🎵 Carregar e descarregar o som
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/music/pokemon.mp3")
      );
      setSound(sound);
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const handlePlayPause = async () => {
    Vibration.vibrate(50);
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Pokédex</Text>

          <Pressable onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause size={32} color="#ffffff" />
            ) : (
              <Play size={32} color="#ffffff" />
            )}
          </Pressable>
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
            data={pokemon.filter((p) =>
              p.name.toLowerCase().includes(search.toLowerCase())
            )}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => {
                  Vibration.vibrate(50);
                  toggleModal(item.name);
                }}
              >
                <View style={styles.card}>
                  <View style={styles.cardInfoLeft}>
                    <Image
                      style={{ width: 100, height: 100 }}
                      source={{ uri: item.image }}
                    />
                    <View>
                      <Text>#{index + 1}</Text>
                      <Text style={styles.cartText}>{item.name}</Text>
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
              Vibration.vibrate(50);
              const found = pokemon.find(
                (p) => p.name.toLowerCase() === search.toLowerCase()
              );

              if (found) {
                toggleModal(found.name);
              } else {
                try {
                  const response = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`
                  );
                  if (!response.ok) throw new Error("Pokémon não encontrado");
                  const data = await response.json();
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
          onBackdropPress={() => {
            Vibration.vibrate(50);
            toggleModal();
          }}
          swipeDirection="down"
          onSwipeComplete={() => {
            Vibration.vibrate(50);
            toggleModal();
          }}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Pokemon name={selectedPokemon} />
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f13921",
  },
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
    paddingHorizontal: width * 0.07,
  },
  logo: {
    color: "#ffffff",
    fontSize: width < 350 ? 28 : 36,
    fontWeight: "bold",
  },
  info: {
    color: "#FFF",
    fontSize: width < 350 ? 16 : 19,
    paddingHorizontal: width * 0.07,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 15,
    backgroundColor: "#d78e8582",
    paddingVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    marginHorizontal: width * 0.07,
    marginVertical: 15,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: width < 350 ? 14 : 16,
  },
  content: {
    backgroundColor: "#eaeaea",
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: width * 0.04,
  },
  contentTitle: {
    color: "#000000",
    fontSize: width < 350 ? 18 : 20,
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: width < 350 ? 15 : 20,
    justifyContent: "space-between",
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#b4b4b47d",
  },
  cardInfoLeft: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  cartText: {
    color: "#1f1f1f",
    fontSize: width < 350 ? 13 : 15,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  footer: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButton: {
    backgroundColor: "#F7776A",
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 6,
  },
  footerButtonText: {
    color: "#FFF",
    fontSize: width < 350 ? 14 : 16,
    fontWeight: "600",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    height: height * 0.8,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
});
