# Multi-Layer Staged Deployment Decision Support System

This repository stores the codebase for the Multi-Layer Staged Deployment Decision Support System (MLSD-DDS). The MLSD-DDS allows constellation designers to design and assess the value of flexibility in mega-constellations that use multi-layer or single-layer staged deployment. It was built as part of my masters thesis on modelling and analysing the effectiveness of multi-layer staged deployment in mega-constellations.

![DSS Screenshots](https://user-images.githubusercontent.com/23026627/120558500-7a3ba600-c3f7-11eb-9590-0dcb3fdda9a5.png)
The above image displays screenshots of the MLSD-DDS in action. Spiralling clockwise from top left corner: visualisation suite, results panel, architectural tradespace explorer, configuration panel, constellation visual comparisons, heatmap generator, and loading screen.

## Live Demo
A live demo can be accessed [here](https://multi-layer-staged-deployment-dss.netlify.app/)

## Project Implementation
The project is built in JavaScript, React.js, Three.js, React Three Fiber, and SASS.

## File Structure
The project has two root directories: `/public` and `/src`.
* `/public` stores publically accessible data, including icon images and index.html.
* `/src` contains all of the source code; the 'brains' of the decision support system.

The following files and directories are found in `/src`:

### `/components`
`/components` stores all of the React components used in the project. These are split into 4 sub-directories:
* `/blocks` stores custom utility React components, reminiscant to [Chakra UI](https://chakra-ui.com/).
* `/media2` stores texture media for React Three Fiber.
* `/simulator` stores all interface components.
* `/visualiser` stores all three.js models, React Three Fiber components, and visualiser GUI in the '3D Visualiser' results tab.

### `/utils`
`/utils` stores all of the brains of the project. Several files exist in this directory. There is one sub-directory:
* `/models` stores the code for the capacity, cost, and demand models.

### `/utils`
`/utils` stores all of the brains of the project. Several files exist in this directory. There is one sub-directory:
* `/models` stores the cost, capacity, and demand models.

### `/scss`
`/scss` stores all css code, written in Sass. The root sass file is `App.scss`, which imports all other scss files.

### `/css`
`/css` stores all the compiled css code used in the project.

### `App.js`
`App.js` is the root React component that all others render from.

### `config.js`
`config.js` stores a large collection of low-level details for every aspect of the project.

### `index.js`
`index.js` is the entrypoint for the application, and renders `App.js.
