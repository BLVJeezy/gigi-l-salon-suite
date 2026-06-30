## Plan: hero-foto via `object-position` (al actief — bevestigen + tunen)

De omschakeling is in de vorige stap al doorgevoerd. De huidige opzet in `src/components/sections.tsx`:

- Config bovenaan:
  ```ts
  const HERO_BROW_OFFSET = { mobile: "25%", tablet: "30%", desktop: "40%" };
  ```
- CSS-klasse `.hero-brow-img`: `position: absolute; inset: 0; width/height: 100%; object-fit: cover; object-position: center <offset>;` met media queries op 768px en 1024px.
- Alle hero-slides renderen nu een `<img class="hero-brow-img">` i.p.v. een `background-image` div.

Hoe tunen (0% = oog hoog in beeld, 100% = oog laag):
- Pas alleen de waarde aan in `HERO_BROW_OFFSET` voor de juiste breakpoint.
- Mobiel = viewport < 768px, tablet = 768–1023px, desktop ≥ 1024px.

Geen extra code-wijziging nodig tenzij je wil dat ik:
1. De defaults opnieuw afstem (geef gewenste waardes per breakpoint), of
2. Een extra breakpoint toevoeg (bv. `sm` op 640px of `xl` op 1280px), of
3. De config naar een apart bestand verplaats (bv. `src/config/hero.ts`) voor nog snellere vindbaarheid.

Laat weten welke van 1/2/3 (of een combinatie) je wil, dan voer ik dat in build-modus uit. Anders is dit ticket al klaar.