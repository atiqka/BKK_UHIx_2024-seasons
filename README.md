# Bangkok Metropolitan Area (BMA) Urban Heat Index (UHIx) for Seasons in 2024


Author: Atiq Kainan Ahmed. Email: atiqka@yahoo.com

---

Output UHIx seasonal maps of BMA can be found here. https://atiq-project-july2025.projects.earthengine.app/view/bmaheat2024

---

## Introduction

This is a Google Earth Engine (GEE) exercise for generating seasonal **Urban Heat Index (UHIx)** composites over the Bangkok Metropolitan Area (BMA) using Landsat 9 Collection 2 Level-2 data for the year 2024.

Bangkok is one of the most rapidly urbanizing megacities in Southeast Asia. Dense built-up areas, limited green space, extensive impervious surfaces, and high population density combine to create intense urban heat island (UHI) effects. These elevated temperatures, particularly during the hot season, increase heat stress, energy demand for cooling, and public health risks for vulnerable populations.

Traditional Land Surface Temperature (LST) maps provide valuable information about surface heating, but they do not fully capture human thermal comfort. The **Heat Index** (also referred to here as UHIx) integrates temperature with relative humidity to better approximate the “feels-like” temperature experienced by people. In tropical cities such as Bangkok, high humidity significantly amplifies heat stress, making the Heat Index a more relevant indicator for urban climate studies, public health planning, and climate adaptation strategies.

This repository provides a reproducible Google Earth Engine workflow that generates seasonal mean Heat Index composites for Bangkok using Landsat 9 Collection 2 Level-2 surface reflectance and surface temperature data. Three seasons aligned with Thailand’s climatological calendar are mapped:

| Season | Months              | Typical Characteristics                  |
|--------|---------------------|------------------------------------------|
| Cool   | November – February | Lower temperatures, lower humidity       |
| Hot    | March – May         | Peak heat and high humidity              |
| Rainy  | June – October      | High humidity, frequent cloud cover      |

By producing consistent seasonal UHIx maps at 30 m resolution, this work supports:

- Urban heat vulnerability assessment  
- Identification of heat hotspots within the BMA  
- Evaluation of seasonal differences in thermal comfort  
- Input data for climate adaptation and green infrastructure planning  

The relative humidity component is estimated from NDVI as a simple proxy, a practical approach when direct atmospheric humidity measurements at the required spatial and temporal resolution are unavailable.

The js script developed calculates a Heat Index (°C) for each Landsat 9 scene using:

  1. **Land Surface Temperature (LST)** derived from the `ST_B10` band  
  2. **NDVI** (as a proxy for relative humidity)  
  3. The standard Rothfusz regression equation for Heat Index

Seasonal mean composites are then generated, visualized, and exported to Google Drive.

---

## Data Sources

| Dataset | Collection / Asset | Description |
|---------|--------------------|-------------|
| Landsat 9 | `LANDSAT/LC09/C02/T1_L2` | Surface Reflectance + Surface Temperature (Collection 2, Level 2) |
| BMA Boundary | `projects/atiq-project-july2025/assets/BMA_districts` | Bangkok Metropolitan Area district boundaries |

**Cloud filtering:** Scenes with >20% cloud cover are excluded.

---

## Methodology

### 1. Land Surface Temperature (°C)

```javascript
ST_B10 × 0.00341802 + 149.0 − 273.15
```

### 2. NDVI

```javascript
(SR_B5 − SR_B4) / (SR_B5 + SR_B4)
```

### 3. Relative Humidity Proxy

```javascript
RH = NDVI × 60 + 30
```

*(Simple linear approximation used in the absence of atmospheric humidity data)*

### 4. Heat Index (°C)

Rothfusz regression:

```
HI = −8.784695 + 1.61139411·T + 2.338549·RH − 0.14611605·T·RH
     − 0.012308094·T² − 0.016424828·RH² + 0.002211732·T²·RH
     + 0.00072546·T·RH² − 0.000003582·T²·RH²
```


---

## Output

| File | Description |
|------|-------------|
| `Bangkok_UHIx_Cool_Mean_2024_LC09.tif` | Cool season mean Heat Index |
| `Bangkok_UHIx_Hot_Mean_2024_LC09.tif` | Hot season mean Heat Index |
| `Bangkok_UHIx_Rainy_Mean_2024_LC09.tif` | Rainy season mean Heat Index |

- **Resolution:** 30 m  
- **CRS:** EPSG:4326  
- **Value range (visualization):** 25–50 °C  

---

## Visualization Palette

The maps use a sequential palette from dark purple (cooler) to dark red (hotter):

```
440154 → 3b528b → 21918c → 5ec962 → fde725 → f7943d → cf4446 → 9e0142
```

---

## Notes & Limitations

- The relative humidity is estimated from NDVI and is **not** a measured atmospheric RH value. This is a common simplification when humidity data is unavailable.
- The Cool season includes November–December 2023 + January–February 2024 to align with the Thai climatological definition.
- Cloud cover threshold is set to 20%. Adjust if needed for denser temporal coverage.
- Very cloudy months may result in sparse or no valid pixels for some seasons.
- Results should be interpreted as relative spatial patterns of heat stress rather than absolute meteorological Heat Index values.

---


## License

MIT License

Copyright (c) 2025 Atiq Kainan Ahmed.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
