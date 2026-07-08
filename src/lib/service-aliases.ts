// Maps localized service names (FR / NL / EN) to their canonical French name
// as stored in the `services` table. Used to look up duration_min consistently
// no matter which language the client booked in.
export const SERVICE_ALIASES: Record<string, string> = {
  // Coiffure
  "Tresses africaines": "Tresses africaines",
  "Afrikaanse vlechten": "Tresses africaines",
  "African braids": "Tresses africaines",
  "Coupes européennes": "Coupes européennes",
  "Europese knipbeurten": "Coupes européennes",
  "European cuts": "Coupes européennes",
  "Locks & crochet": "Locks & crochet",
  "Tissages": "Tissages",
  "Weaves": "Tissages",
  "Chignons & événements": "Chignons & événements",
  "Opsteekkapsels & events": "Chignons & événements",
  "Updos & event styling": "Chignons & événements",
  "Colorations": "Colorations",
  "Kleuringen": "Colorations",
  "Colouring": "Colorations",
  "Perruques & mèches": "Perruques & mèches",
  "Pruiken & extensions": "Perruques & mèches",
  "Wigs & extensions": "Perruques & mèches",
  // Nails
  "Pose complète": "Pose complète",
  "Volledige set": "Pose complète",
  "Full set": "Pose complète",
  "Dépose de gel": "Dépose de gel",
  "Gel verwijderen": "Dépose de gel",
  "Gel removal": "Dépose de gel",
  "Réparation 1 doigt": "Réparation 1 doigt",
  "Reparatie 1 nagel": "Réparation 1 doigt",
  "Repair 1 nail": "Réparation 1 doigt",
  "Pédicure sans tips": "Pédicure sans tips",
  "Pedicure zonder tips": "Pédicure sans tips",
  "Pedicure without tips": "Pédicure sans tips",
  "Vernis semi-permanent": "Vernis semi-permanent",
  "Semi-permanente lak": "Vernis semi-permanent",
  "Semi-permanent polish": "Vernis semi-permanent",
  // Microshading
  "Microshading": "Microshading",
  "Retouche": "Retouche",
  "Bijwerking": "Retouche",
  "Refill": "Retouche",
  "Touch-up": "Retouche",
};

export function canonicalServiceName(name: string): string {
  return SERVICE_ALIASES[name] ?? name;
}
