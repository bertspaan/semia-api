# The Sensory Moving Image Archive: JSON API for metadata and search

API for [bertspaan.nl/semia](https://bertspaan.nl/semia), a visualization and exploration of the similarity of 103,273 shots from 6,969 videos from [Open Images](https://openbeelden.nl/).

__[Explore the Sensory Moving Image Archive](https://bertspaan.nl/semia/)!__

[![](https://github.com/bertspaan/semia/raw/master/public/semia.jpg)](https://bertspaan.nl/semia/)

This project depends on two other repositories:

- [`semia`](https://github.com/bertspaan/semia): Visualization and exploration tool, made with Vue;
- [`semia-data`](https://github.com/bertspaan/semia-data): Data, scripts and tools.

For more information about the project, see the [About page](https://bertspaan.nl/semia/#/about).

## API

This API runs on [Glitch](https://glitch.com/edit/#!/semia-api), and its source code is available on both [Glitch](https://glitch.com/edit/#!/semia-api) and [GitHub](https://github.com/bertspaan/semia-api).

It does two things: 

1. Publish metadata and similarity data of a single movie, for example [https://semia-api.glitch.me/videos/98168](https://semia-api.glitch.me/videos/98168);
2. Text search in all movie metadata, for example [https://semia-api.glitch.me/search?q=afsluitdijk](https://semia-api.glitch.me/search?q=afsluitdijk).
