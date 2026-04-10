import type { DriveStep } from "driver.js";

export const CALCULATOR_TOUR_KEY = "calculator";

export function getCalculatorTourSteps(): DriveStep[] {
  const steps: DriveStep[] = [
    {
      element: "#calc-config",
      popover: {
        title: "Configurá tu proyección",
        description:
          "Elegí la fecha de recategorización, una categoría objetivo opcional, " +
          "el margen de seguridad y tu tipo de actividad.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#calc-months",
      popover: {
        title: "Ingresá tus montos mensuales",
        description:
          "Completá cuánto facturaste (o pensás facturar) cada mes. " +
          "Los meses pasados se marcan como históricos y los futuros como proyectados.",
        side: "top",
        align: "center",
      },
    },
  ];

  // Only include results step if the user has entered data
  if (document.getElementById("calc-results")) {
    steps.push({
      element: "#calc-results",
      popover: {
        title: "Resultado de la proyección",
        description:
          "Acá ves la categoría resultante, el monto recomendado por mes, " +
          "la cuota y cuánto margen te queda hasta el tope.",
        side: "top",
        align: "center",
      },
    });
  }

  steps.push(
    {
      element: "#calc-categories",
      popover: {
        title: "Tabla de categorías",
        description:
          "Referencia completa con los topes de ingresos y cuotas mensuales " +
          "para cada categoría de Monotributo vigente.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#calc-faq",
      popover: {
        title: "Preguntas frecuentes",
        description:
          "Respuestas a las dudas más comunes sobre recategorización, " +
          "categorías y cómo funciona la calculadora.",
        side: "top",
        align: "center",
      },
    }
  );

  return steps;
}
