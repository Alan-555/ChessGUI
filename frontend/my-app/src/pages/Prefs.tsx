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
  import { useEffect, useState } from "react";
import { BoardThemes, Themes, useGlobalConfig } from "../providers/GlobalConfigProvider";
  
  export default function Preferences() {
    const globalCfg = useGlobalConfig();
    const [orientation, setOrientation] = useState<"BottomMe" | "BottomWhite">(globalCfg.config.render.preferredPlayerSide!);
    const [scaling, setScaling] = useState(!globalCfg.config.render.imgSize);
    const [customScaling, setCustomScaling] = useState(globalCfg.config.render.imgSize ? globalCfg.config.render.imgSize : 50 );
    const [boardTheme, setBoardTheme] = useState(globalCfg.config.render.theme);
    const [soundEnabled, setSoundEnabled] = useState(true);
  
    const savePreferences = () => {
      globalCfg.setConfig({
        render:{
          imgSize: scaling ? undefined : customScaling,
          preferredPlayerSide : orientation,
          theme: boardTheme
        }
      });
    };

    useEffect(()=>savePreferences(), [orientation,scaling,customScaling,boardTheme]);
    
  
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
            <RadioGroup value={orientation} onChange={(c)=>setOrientation(c as any)}>
              <HStack spacing={4}>
                <Radio value="BottomMe">My color at the bottom</Radio>
                <Radio value="BottomWhite">White at the bottom</Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
            {/* Screen Scaling */}
            <FormControl>
            <FormLabel>Screen Scaling</FormLabel>
            <HStack>
              <Switch
              isChecked={scaling}
              onChange={() =>
                setScaling(!scaling)
              }
              />
              <Text>{scaling ? "Auto" : "Set to"}</Text>
              {!scaling && (
              <input
                type="number"
                value={customScaling}
                onChange={(e) => setCustomScaling(Number(e.target.value))}
                min={50}
                max={200}
                step={10}
                style={{
                width: "60px",
                textAlign: "center",
                backgroundColor: "#2D3748",
                color: "white",
                border: "1px solid #4A5568",
                borderRadius: "4px",
                }}
              />
              )}
            </HStack>
            </FormControl>
  
          {/* Board Theme - Dropdown */}
          <FormControl>
            <FormLabel>Board Theme</FormLabel>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {boardTheme}
              </MenuButton>
              <MenuList>
                {Themes.map((theme) => (
                  <MenuItem  key={theme} onClick={() => setBoardTheme(theme)}>
                    {theme}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>
  
          {/* Toggles */}   
  
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Enable Sounds</FormLabel>
            <Switch
              isChecked={soundEnabled}
              onChange={() => setSoundEnabled(!soundEnabled)}
            />
          </FormControl>
  
        </VStack>
      </Box>
    );
  }
  