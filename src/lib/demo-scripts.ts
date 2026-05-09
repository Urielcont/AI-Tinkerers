export interface DemoScript {
  id: string;
  label: string;
  emphasis: string;
  transcript: string;
}

export const demoScripts: DemoScript[] = [
  {
    id: "chest-alert",
    label: "Urgencia alta",
    emphasis: "Dolor torácico y dificultad respiratoria",
    transcript:
      "Tengo dolor de pecho desde esta mañana, me cuesta respirar y tengo 62 años.",
  },
  {
    id: "respiratory-mid",
    label: "Urgencia media",
    emphasis: "Fiebre y tos con flema",
    transcript:
      "Tengo fiebre de 38.5 desde ayer y tos con flema. Me siento muy cansado y me duele el pecho al toser.",
  },
  {
    id: "stress-low",
    label: "Urgencia baja",
    emphasis: "Dolor de cabeza por estrés",
    transcript:
      "Me duele la cabeza desde hace una hora y creo que es por estrés. No tengo fiebre ni otros síntomas.",
  },
];
