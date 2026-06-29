## Doel

Op mobiel/tablet de hoogte van het afspraak­formulier in de hero zakken zodat de onderkant van het formulier net boven de 3 slide-dots eindigt. Layout, stijl en stappen van het formulier blijven exact hetzelfde — alleen de container groeit mee.

## Wijziging

Eén bestand: `src/components/sections.tsx`

1. Mobiele formulier-wrapper (regel 97) wordt een flex-kolom die de beschikbare hoogte vult:
  - `mt-14 space-y-2 px-1` → `mt-14 space-y-2 px-1 flex flex-col min-h-[calc(100vh-13rem)]`
  - De `min-h` is afgestemd op de hero (`pt-24 pb-16` + dots op `bottom-3`) zodat de onderkant van het blok net boven de dots ligt op een standaard mobiel scherm.
2. `<BookingForm compact />` krijgt een wrapper `<div className="flex-1">` zodat de bestaande compacte stappen-UI ongewijzigd blijft maar de container de extra ruimte opvult tot aan de telefoon-CTA.
3. De telefoon-CTA (`+32 484 …`) blijft direct onder het formulier; samen vullen ze de hoogte tot net boven de dots.

Niets aan `BookingForm.tsx` zelf wijzigen — geen nieuwe stappen, geen styling-aanpassing, geen extra padding in de stappen.

## Verificatie

- Mobiele preview (390×844): onderkant van de gele telefoon-knop zit net boven de 3 slide-dots, formulier behoudt exact dezelfde breedte/stijl/stappen.
- Desktop (`lg:`): ongewijzigd — `lg:hidden` zorgt dat de min-height niet op desktop toegepast wordt.