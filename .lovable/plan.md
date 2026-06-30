## Bestand
`src/components/sections.tsx` — bovenaan in de `Hero` component (rond regel 48–66).

## De twee regels die er toe doen

Er zijn 4 vrijwel identieke `<div>` blokken (outgoing mobiel, outgoing desktop, incoming mobiel, incoming desktop). De wenkbrauw-foto is **slide index 2** (`cur === 2` / `prev === 2`).

Voor mobiel staat er nu:
```ts
backgroundPosition: cur === 2 ? "center 55%" : "center top"
backgroundSize:     cur === 2 ? "auto 75%"  : "cover"
```

Voor desktop:
```ts
backgroundPosition: cur === 2 ? "center 40%" : "center"
backgroundSize: "cover"
```

## Wat elk getal doet

- **`backgroundPosition: "center XX%"`** — verschuift de foto verticaal.
  - Lager getal (bv. `"center 20%"`) → foto schuift **omhoog**, oog komt **hoger** in beeld.
  - Hoger getal (bv. `"center 80%"`) → foto schuift **omlaag**, oog komt **lager** in beeld.
  - Vuistregel: wil je het oog 5% lager? Verhoog het percentage met ~10.

- **`backgroundSize: "auto XX%"`** — bepaalt de zoom.
  - Lager getal (bv. `"auto 60%"`) → meer **uitgezoomd** (foto kleiner, meer zwart eromheen).
  - Hoger getal (bv. `"auto 90%"` of `"cover"`) → meer **ingezoomd** (foto groter, vult meer van het scherm).

## Belangrijk: pas het op 2 plekken aan

De foto verschijnt in zowel de **outgoing** als de **incoming** slide-div (anders verspringt hij bij de fade-overgang). Dus als je `"center 55%"` wijzigt, doe het bij **beide** mobiel-regels (en idem voor desktop op de twee desktop-regels).

Tip: zoek met Cmd+F op `cur === 2` om alle 4 plekken meteen te vinden.

## Snel voorbeeld
Oog nóg iets lager + iets meer uitgezoomd op mobiel:
```ts
backgroundPosition: cur === 2 ? "center 65%" : "center top"
backgroundSize:     cur === 2 ? "auto 70%"  : "cover"
```
