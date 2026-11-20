# VESPER — Evening Optics

A concept e-commerce site for a fictional luxury sunglasses house, built as a portfolio piece.

**Highlights**
- **Scroll-driven hero.** One sticky viewport and about seven screens of scroll. A model lowers her sunglasses, the scene dissolves to black, then three close-up chapters follow (lens, acetate, hinge, with the temples folding). The sunglasses fly off as the buy panel rises.
- **Procedural 3D catalogue.** Every frame (12 models, 21 colourways) is generated in code with Three.js from a few parameters: shape, material, frame colour or pattern, lens gradient, mirror. The same models render the shop's product "photos" and the interactive 360° viewer.
- **Full store flow.** Collections, a filterable shop, product pages with colourways and lens upgrades, a persistent bag drawer, and a demo checkout with an order confirmation.

**Stack:** Vite · React 18 · React Router · Three.js · GSAP ScrollTrigger · Lenis

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/ (SPA rewrites included for Vercel and Netlify)
```

## Hero photos

Put two AI-generated photos in `public/hero/`:

| File | Content |
|---|---|
| `hero-a.jpg` | The model with the sunglasses pushed up in her hair |
| `hero-b.jpg` | The same shot with the sunglasses on |

Without them the hero runs on a warm gradient with the 3D frame on stage. Once they are in, adjust `FACE` in `src/components/Hero.jsx` so the 3D frame lands on the glasses in `hero-b.jpg`.

## Structure

```
src/
  three/buildSunglasses.js   procedural model (shapes, rims, hinges, temples, fold)
  three/materials.js         acetate, tortoise, crystal, metal and gradient-lens materials
  three/studio.js            offscreen renderer → cached product images
  components/Hero.jsx        scroll timeline (keyframes for camera and DOM layers)
  components/Viewer3D.jsx    drag-to-rotate product viewer
  data/products.js           collections, products, colourways
  pages/                     Home, Shop, Collection, Product, Checkout, About
```

Vesper is a concept brand made for a design study. Products, specs and prices are fictional.
