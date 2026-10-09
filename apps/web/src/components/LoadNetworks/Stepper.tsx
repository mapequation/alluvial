import { Steps } from "@chakra-ui/react";

export default function Stepper({
  activeStep,
  acceptedFormats,
}: {
  activeStep: number;
  acceptedFormats: string;
}) {
  const steps = [
    {
      title: "Run Infomap",
      description: (
        <a href="//mapequation.org/infomap">Infomap Online or load net-files</a>
      ),
    },
    {
      title: "Load network partitions",
      description: (
        <a href="//mapequation.org/infomap/#Output">
          Formats: {acceptedFormats}
        </a>
      ),
    },
    {
      title: "Create alluvial diagram",
      description: "Highlight partition differences",
    },
  ];

  return (
    <Steps.Root
      step={activeStep}
      count={steps.length}
      colorPalette="blue"
      mx="auto"
      my="1em"
      w="90%"
    >
      <Steps.List>
        {steps.map((step, index) => (
          <Steps.Item key={index} index={index} title={step.title}>
            <Steps.Trigger>
              <Steps.Indicator />
              <div>
                <Steps.Title>{step.title}</Steps.Title>
                <Steps.Description>{step.description}</Steps.Description>
              </div>
            </Steps.Trigger>
            <Steps.Separator />
          </Steps.Item>
        ))}
      </Steps.List>
    </Steps.Root>
  );
}
