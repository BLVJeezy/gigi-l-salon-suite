## Probleem
Met `background-image` op de slide-div hangt het bereik van `background-position` af van hoeveel de afbeelding overflowt — bij een portret-foto in een portret-container blijft die marge soms minimaal, waardoor 25% en 75% nauwelijks verschil maken.

## Oplossing
De wenkbrauw-slide rendert als een echte `<img>` met `object-fit: cover` en `object-position`. Dat geeft hetzelfde "vult alles" gedrag, maar `object-position` werkt voorspelbaar van 0% → 100% over de volledige overflow, en breakpoints kunnen via één CSS-class met media queries de offset bepalen.

## Wijzigingen in `src/components/sections.tsx`

1. **Config blijft bovenaan** (één plek tunen):
   ```ts
   const HERO_BROW_OFFSET = {
     mobile:  "25%", // < 768px
     tablet:  "30%", // 768–1023px
     desktop: "40%", // ≥ 1024px
   };
   ```

2. **`<style>` block** vervangt de bg-class door een img-class:
   ```css
   .hero-brow-img {
     position: absolute; inset: 0;
     width: 100%; height: 100%;
     object-fit: cover;
     object-position: center 25%;
   }
   @media (min-width: 768px)  { .hero-brow-img { object-position: center 30%; } }
   @media (min-width: 1024px) { .hero-brow-img { object-position: center 40%; } }
   ```

3. **Render-logica**: bij slide index 2 wordt een `<img>` gerenderd in plaats van een `background-image` div. De andere slides blijven exact zoals nu (background-image). De fade-in/fade-out wrappers blijven.

```text
slide 0,1  → div met background-image (zoals nu)
slide 2    → div wrapper met fade-class + <img className="hero-brow-img" />
```

4. **Outgoing + incoming** krijgen allebei dezelfde behandeling, zodat de overgang naadloos blijft.

## Resultaat
- `HERO_BROW_OFFSET.tablet = "80%"` zakt het oog echt zichtbaar omlaag op 768px.
- Range 0% → 100% dekt nu de volledige hoogte van de foto in de viewport.
- Tunen blijft op één plek in code.
