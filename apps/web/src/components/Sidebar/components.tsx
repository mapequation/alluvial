import {
  Button as CkButton,
  ButtonProps,
  HStack,
  List,
  ListItemProps,
  NativeSelect,
  RadioGroup,
  Slider as CkSlider,
  SliderRootProps,
  Switch as CkSwitch,
  SwitchRootProps,
  VStack,
} from "@chakra-ui/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Tooltip } from "../ui/tooltip";

export function Button(props: ButtonProps) {
  return (
    <CkButton
      width="full"
      flex="1"
      minW={0}
      variant="outline"
      // size="xs" gives the v2 sm height (~32px); fontSize="sm" restores the
      // v2 sm label size (~14px) since v3's "xs" textStyle defaults to 12px.
      size="xs"
      fontSize="sm"
      justifyContent="flex-start"
      fontWeight={500}
      {...props}
    />
  );
}

export function ListItemButton(props: ButtonProps) {
  return (
    <List.Item>
      <Button {...props} />
    </List.Item>
  );
}

export function ListItemHeader(props: ListItemProps) {
  return (
    <List.Item
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="tight"
      fontSize="0.8rem"
      pt={6}
      {...props}
    />
  );
}

export function Label({ children, ...props }: any) {
  return (
    <span style={{ display: "inline-block", width: "50%" }} {...props}>
      {children}
    </span>
  );
}

type SliderHelperProps = Omit<SliderRootProps, "onChange" | "value"> & {
  label: string;
  value: number;
  onChange: (value: number) => void;
  valueLabelFormat?: (value: number) => string | number;
};

export function Slider({
  label,
  value,
  onChange,
  valueLabelFormat,
  ...props
}: SliderHelperProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setCurrentValue(value), [value, setCurrentValue]);

  return (
    <List.Item>
      <Label>{label}</Label>
      <CkSlider.Root
        defaultValue={[value]}
        value={[currentValue]}
        w="50%"
        size="sm"
        colorPalette="blue"
        display="inline-block"
        // Match the v2 look: small thumb (10px) and thin track (3px).
        style={
          {
            "--slider-thumb-size": "10px",
            "--slider-track-size": "3px",
          } as CSSProperties
        }
        onValueChange={(details) => setCurrentValue(details.value[0])}
        onValueChangeEnd={(details) => onChange(details.value[0])}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        {...props}
      >
        <CkSlider.Control>
          <CkSlider.Track>
            <CkSlider.Range />
          </CkSlider.Track>
          <Tooltip
            showArrow
            open={isOpen}
            positioning={{ placement: "top" }}
            content={
              valueLabelFormat != null
                ? valueLabelFormat(currentValue)
                : currentValue
            }
          >
            <CkSlider.Thumb index={0}>
              <CkSlider.HiddenInput />
            </CkSlider.Thumb>
          </Tooltip>
        </CkSlider.Control>
      </CkSlider.Root>
    </List.Item>
  );
}

export function RadioGroupSelect<T extends string>({
  legend,
  value,
  onChange,
  options,
  hstack = false,
}: {
  legend: string;
  value: T;
  onChange: (value: T) => void;
  options: T[];
  hstack?: boolean;
}) {
  const Wrapper = hstack ? HStack : VStack;

  return (
    <List.Item>
      <HStack>
        <Label>{legend}</Label>
        <RadioGroup.Root
          value={value}
          onValueChange={(details) => onChange(details.value as T)}
          size="sm"
          colorPalette="blue"
        >
          <Wrapper align="left">
            {options.map((opt) => (
              <RadioGroup.Item value={opt} key={opt}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>{opt}</RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
          </Wrapper>
        </RadioGroup.Root>
      </HStack>
    </List.Item>
  );
}

export { RadioGroupSelect as RadioGroup };

type SwitchHelperProps = Omit<SwitchRootProps, "onChange"> & {
  label: string;
  onChange: (value: boolean) => void;
};

export function Switch({ label, onChange, ...props }: SwitchHelperProps) {
  return (
    <List.Item>
      <Label>{label}</Label>
      <CkSwitch.Root
        size="sm"
        colorPalette="blue"
        onCheckedChange={(details) => onChange(details.checked)}
        {...props}
      >
        <CkSwitch.HiddenInput />
        <CkSwitch.Control>
          <CkSwitch.Thumb />
        </CkSwitch.Control>
      </CkSwitch.Root>
    </List.Item>
  );
}

export function Select({
  value,
  setValue,
  options,
}: {
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  return (
    <NativeSelect.Root
      size="sm"
      w="50%"
      variant="plain"
      display="inline-block"
    >
      <NativeSelect.Field
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
