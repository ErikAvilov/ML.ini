import type { Locale } from "@/i18n/config";

/** Répliques Mira — Mission 01 (format invalide uniquement) */
export function getMiraFormatFailLines(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "The model understood the message.",
      "The application didn't understand the model.",
      "Look at the expected output again.",
    ];
  }
  return [
    "Le modèle a compris le message.",
    "L’application, elle, n’a pas compris le modèle.",
    "Regarde à nouveau le format attendu.",
  ];
}

export function getMiraSuccessLines(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Good.",
      "Now MILDRED can make the same decision without someone reading every message.",
      "That's automation.",
    ];
  }
  return [
    "Bien.",
    "MILDRED peut maintenant prendre cette décision sans qu’une personne lise chaque message.",
    "Ça, c’est de l’automatisation.",
  ];
}

export function getMiraSuccessLinesMission02(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Better.",
      "You didn't make MILDRED smarter.",
      "You made the rules clearer.",
    ];
  }
  return [
    "Mieux.",
    "Tu n’as pas rendu MILDRED plus intelligente.",
    "Tu as rendu les règles plus claires.",
  ];
}
