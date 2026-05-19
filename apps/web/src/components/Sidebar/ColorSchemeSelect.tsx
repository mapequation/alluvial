import { NativeSelect } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import { SCHEME_GROUPS, SchemeName } from "../../store/schemes";

type Props = React.ComponentProps<typeof NativeSelect.Root>;

const ColorSchemeSelect = observer(function ColorSchemeSelect(props: Props) {
  const store = useContext(StoreContext);

  return (
    <NativeSelect.Root
      size="sm"
      variant="plain"
      display="inline-block"
      {...props}
    >
      <NativeSelect.Field
        value={store.selectedSchemeName}
        onChange={(event) =>
          store.setSelectedScheme(event.target.value as SchemeName)
        }
        css={{
          "& > optgroup": { color: "gray.900", fontStyle: "normal" },
        }}
      >
        {Array.from(Object.entries(SCHEME_GROUPS)).map(([group, schemes]) => (
          <optgroup label={group} key={group}>
            {schemes.map((scheme) => (
              <option key={scheme} value={scheme}>
                {scheme}
              </option>
            ))}
          </optgroup>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
});

export default ColorSchemeSelect;
