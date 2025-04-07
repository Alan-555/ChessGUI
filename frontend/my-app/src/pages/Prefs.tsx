import {
    Box,
    Heading,
    VStack,
    HStack,
    RadioGroup,
    Radio,
    Switch,
    FormControl,
    FormLabel,
    Button,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Text,
    IconButton,
  } from "@chakra-ui/react";
  import { ChevronDownIcon } from "@chakra-ui/icons";
  import { useState } from "react";
  
  export default function Preferences() {
    const [orientation, setOrientation] = useState("white");
    const [pieceStyle, setPieceStyle] = useState("Classic");
    const [boardTheme, setBoardTheme] = useState("Blue");
    const [highlightMoves, setHighlightMoves] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
  
    const toast = useToast();
  
    const savePreferences = () => {
      toast({
        title: "Preferences saved.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    };
  
    return (
      <Box
        maxW="500px"
        mx="auto"
        p={8}
        mt={8}
        bg="gray.700"
        borderRadius="md"
        color="white"
      >
        <Heading mb={6} size="lg">
          Preferences
        </Heading>
  
        <VStack spacing={5} align="stretch">
          {/* Orientation */}
          <FormControl>
            <FormLabel>Board Orientation</FormLabel>
            <RadioGroup value={orientation} onChange={setOrientation}>
              <HStack spacing={4}>
                <Radio value="white">White at Bottom</Radio>
                <Radio value="black">Black at Bottom</Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
  
          {/* Piece Style - Dropdown */}
          <FormControl>
            <FormLabel>Piece Style</FormLabel>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {pieceStyle}
              </MenuButton>
              <MenuList>
                {["Classic", "Neo", "Fantasy", "Alpha"].map((style) => (
                  <MenuItem key={style} onClick={() => setPieceStyle(style)}>
                    {style}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>
  
          {/* Board Theme - Dropdown */}
          <FormControl>
            <FormLabel>Board Theme</FormLabel>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {boardTheme}
              </MenuButton>
              <MenuList>
                {["Blue", "Green", "Wood", "Dark", "Light"].map((theme) => (
                  <MenuItem key={theme} onClick={() => setBoardTheme(theme)}>
                    {theme}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>
  
          {/* Toggles */}
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Highlight Moves</FormLabel>
            <Switch
              isChecked={highlightMoves}
              onChange={() => setHighlightMoves(!highlightMoves)}
            />
          </FormControl>
  
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Enable Sounds</FormLabel>
            <Switch
              isChecked={soundEnabled}
              onChange={() => setSoundEnabled(!soundEnabled)}
            />
          </FormControl>
  
          <Button colorScheme="teal" onClick={savePreferences}>
            Save Preferences
          </Button>
        </VStack>
      </Box>
    );
  }
  