import { Button, Menu, Portal } from "@chakra-ui/react";
import localforage from "localforage";
import { useContext } from "react";
import { LuChevronDown, LuTrash2 } from "react-icons/lu";
import { LoadContext } from "./context";
import { getLocalStorageFiles } from "@mapequation/alluvial-diagram";

localforage.config({ name: "infomap" });

export default function InfomapOnline({
  isDisabled,
  onFileClick,
}: {
  isDisabled: boolean;
  onFileClick: (file: File) => void;
}) {
  const { state, dispatch } = useContext(LoadContext);
  const { localStorageFiles } = state;

  const loadLocalStorage = async () => {
    try {
      const localStorageFiles = await getLocalStorageFiles();
      dispatch({ type: "set", payload: { localStorageFiles } });
    } catch (e: any) {
      console.warn(e);
    }
  };

  return (
    <Menu.Root
      onOpenChange={(details) => {
        if (details.open) void loadLocalStorage();
      }}
    >
      <Menu.Trigger asChild>
        <Button disabled={isDisabled} variant="outline">
          Infomap Online
          <LuChevronDown />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {localStorageFiles.map((file, i) => (
              <Menu.Item
                key={i}
                value={String(i)}
                onClick={() => onFileClick(file)}
              >
                {file.name}
              </Menu.Item>
            ))}
            {localStorageFiles.length !== 0 && (
              <>
                <Menu.Separator />
                <Menu.Item
                  value="clear"
                  disabled={localStorageFiles.length === 0}
                  onClick={() => {
                    dispatch({
                      type: "set",
                      payload: { localStorageFiles: [] },
                    });
                    void localforage.clear();
                  }}
                >
                  <LuTrash2 /> Clear
                </Menu.Item>
              </>
            )}
            {localStorageFiles.length === 0 && (
              <Menu.Item value="empty" disabled>
                No files found
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
