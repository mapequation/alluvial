import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import ModuleTooltip from "./ModuleTooltip";

export default function Tooltip({
  children,
  ...props
}: PropsWithChildren<any>) {
  return (
    <ChakraTooltip.Root openDelay={500} positioning={{ placement: "top" }}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content shadow="xl" borderRadius="sm">
            <ChakraTooltip.Arrow>
              <ChakraTooltip.ArrowTip />
            </ChakraTooltip.Arrow>
            <ModuleTooltip {...props} />
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  );
}
