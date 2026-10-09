import {
  Button,
  Checkbox,
  Fieldset,
  HStack,
  NumberInput,
  Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useId } from "react";

export default function Infomap({
  disabled,
  directed,
  setDirected,
  numTrials,
  setNumTrials,
  twoLevel,
  setTwoLevel,
  run,
}: {
  disabled: boolean;
  directed: boolean;
  setDirected: (directed: boolean) => void;
  numTrials: number;
  setNumTrials: (numTrials: number) => void;
  twoLevel: boolean;
  setTwoLevel: (twoLevel: boolean) => void;
  run: () => void;
}) {
  const id = useId();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Fieldset.Root disabled={disabled}>
        <HStack justify="space-between">
          <Text
            as="label"
            // @ts-expect-error - label htmlFor
            htmlFor={id}
            fontSize="sm"
            fontWeight={400}
            pt={1}
          >
            Trials
          </Text>
          <NumberInput.Root
            id={id}
            size="xs"
            value={String(numTrials)}
            onValueChange={(details) =>
              setNumTrials(Math.max(1, details.valueAsNumber))
            }
            min={1}
            max={100}
            step={1}
          >
            <NumberInput.Input />
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
          </NumberInput.Root>
        </HStack>
        <Checkbox.Root
          disabled={disabled}
          size="sm"
          checked={directed}
          onCheckedChange={(details) => setDirected(details.checked === true)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Directed</Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root
          disabled={disabled}
          size="sm"
          checked={twoLevel}
          onCheckedChange={(details) => setTwoLevel(details.checked === true)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Two-level</Checkbox.Label>
        </Checkbox.Root>
        <Button
          mt={1}
          disabled={disabled}
          loading={disabled}
          size="xs"
          width="full"
          type="submit"
          onClick={run}
        >
          Run Infomap
        </Button>
      </Fieldset.Root>
    </motion.div>
  );
}
