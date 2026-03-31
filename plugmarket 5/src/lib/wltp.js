// EV WLTP Reference Data
// Key: make|model|variant pattern → { wltp_km, battery_gross, battery_usable }
// Variant matching is flexible — we match the best available entry
// Sources: manufacturer specs, EV-Database.org data

const WLTP_DATA = {
  // ── Tesla ──
  "Tesla|Model 3|Standard Range Plus|2019": { wltp: 409, bat: 55, usable: 50 },
  "Tesla|Model 3|Standard Range Plus|2020": { wltp: 448, bat: 55, usable: 50 },
  "Tesla|Model 3|Standard Range Plus|2021": { wltp: 448, bat: 60, usable: 57.5 },
  "Tesla|Model 3|Standard Range|2024": { wltp: 513, bat: 60, usable: 57.5 },
  "Tesla|Model 3|Long Range|2019": { wltp: 560, bat: 75, usable: 72.5 },
  "Tesla|Model 3|Long Range|2020": { wltp: 580, bat: 75, usable: 72.5 },
  "Tesla|Model 3|Long Range|2021": { wltp: 614, bat: 82, usable: 78 },
  "Tesla|Model 3|Long Range|2022": { wltp: 614, bat: 82, usable: 78 },
  "Tesla|Model 3|Long Range|2023": { wltp: 614, bat: 82, usable: 78 },
  "Tesla|Model 3|Long Range|2024": { wltp: 629, bat: 78.1, usable: 75 },
  "Tesla|Model 3|Long Range AWD|2024": { wltp: 602, bat: 78.1, usable: 75 },
  "Tesla|Model 3|Performance|2020": { wltp: 530, bat: 75, usable: 72.5 },
  "Tesla|Model 3|Performance|2021": { wltp: 547, bat: 82, usable: 78 },
  "Tesla|Model 3|Performance|2022": { wltp: 547, bat: 82, usable: 78 },
  "Tesla|Model 3|Performance|2023": { wltp: 547, bat: 82, usable: 78 },
  "Tesla|Model 3|Performance|2024": { wltp: 528, bat: 78.1, usable: 75 },

  "Tesla|Model Y|Standard Range|2022": { wltp: 455, bat: 60, usable: 57.5 },
  "Tesla|Model Y|Long Range|2022": { wltp: 533, bat: 75, usable: 72.5 },
  "Tesla|Model Y|Long Range|2023": { wltp: 533, bat: 75, usable: 72.5 },
  "Tesla|Model Y|Long Range|2024": { wltp: 533, bat: 75, usable: 72.5 },
  "Tesla|Model Y|Long Range AWD|2025": { wltp: 568, bat: 81, usable: 78 },
  "Tesla|Model Y|Long Range RWD|2025": { wltp: 600, bat: 81, usable: 78 },
  "Tesla|Model Y|Performance|2022": { wltp: 514, bat: 75, usable: 72.5 },
  "Tesla|Model Y|Performance|2023": { wltp: 514, bat: 75, usable: 72.5 },
  "Tesla|Model Y|Performance|2024": { wltp: 514, bat: 75, usable: 72.5 },

  "Tesla|Model S|Long Range|2020": { wltp: 610, bat: 100, usable: 95 },
  "Tesla|Model S|Long Range|2021": { wltp: 652, bat: 100, usable: 95 },
  "Tesla|Model S|Long Range|2022": { wltp: 634, bat: 100, usable: 95 },
  "Tesla|Model S|Long Range|2023": { wltp: 634, bat: 100, usable: 95 },
  "Tesla|Model S|Plaid|2021": { wltp: 600, bat: 100, usable: 95 },
  "Tesla|Model S|Plaid|2022": { wltp: 600, bat: 100, usable: 95 },
  "Tesla|Model S|Plaid|2023": { wltp: 600, bat: 100, usable: 95 },

  "Tesla|Model X|Long Range|2020": { wltp: 561, bat: 100, usable: 95 },
  "Tesla|Model X|Long Range|2022": { wltp: 576, bat: 100, usable: 95 },
  "Tesla|Model X|Long Range|2023": { wltp: 576, bat: 100, usable: 95 },
  "Tesla|Model X|Plaid|2022": { wltp: 536, bat: 100, usable: 95 },
  "Tesla|Model X|Plaid|2023": { wltp: 536, bat: 100, usable: 95 },

  // ── BMW ──
  "BMW|iX3|Inspiring|2021": { wltp: 460, bat: 80, usable: 73.8 },
  "BMW|iX3|Inspiring|2022": { wltp: 461, bat: 80, usable: 73.8 },
  "BMW|iX3|Inspiring|2023": { wltp: 461, bat: 80, usable: 73.8 },
  "BMW|iX3||2021": { wltp: 460, bat: 80, usable: 73.8 },
  "BMW|iX3||2022": { wltp: 461, bat: 80, usable: 73.8 },

  "BMW|iX1|xDrive30|2023": { wltp: 440, bat: 66.5, usable: 64.7 },
  "BMW|iX1|xDrive30|2024": { wltp: 440, bat: 66.5, usable: 64.7 },
  "BMW|iX1|eDrive20|2023": { wltp: 475, bat: 66.5, usable: 64.7 },
  "BMW|iX1|eDrive20|2024": { wltp: 475, bat: 66.5, usable: 64.7 },

  "BMW|i4|eDrive35|2022": { wltp: 483, bat: 66, usable: 63.2 },
  "BMW|i4|eDrive40|2022": { wltp: 590, bat: 83.9, usable: 80.7 },
  "BMW|i4|eDrive40|2023": { wltp: 590, bat: 83.9, usable: 80.7 },
  "BMW|i4|eDrive40|2024": { wltp: 590, bat: 83.9, usable: 80.7 },
  "BMW|i4|M50|2022": { wltp: 521, bat: 83.9, usable: 80.7 },
  "BMW|i4|M50|2023": { wltp: 521, bat: 83.9, usable: 80.7 },

  "BMW|i5|eDrive40|2024": { wltp: 582, bat: 83.9, usable: 81.2 },
  "BMW|i5|M60|2024": { wltp: 516, bat: 83.9, usable: 81.2 },

  "BMW|i7|xDrive60|2023": { wltp: 625, bat: 105.7, usable: 101.7 },
  "BMW|i7|xDrive60|2024": { wltp: 625, bat: 105.7, usable: 101.7 },
  "BMW|i7|eDrive50|2024": { wltp: 611, bat: 105.7, usable: 101.7 },

  "BMW|iX|xDrive40|2022": { wltp: 425, bat: 76.6, usable: 71 },
  "BMW|iX|xDrive50|2022": { wltp: 630, bat: 111.5, usable: 105.2 },
  "BMW|iX|xDrive50|2023": { wltp: 630, bat: 111.5, usable: 105.2 },
  "BMW|iX|xDrive50|2024": { wltp: 630, bat: 111.5, usable: 105.2 },
  "BMW|iX|M60|2023": { wltp: 566, bat: 111.5, usable: 105.2 },

  // ── Volkswagen ──
  "Volkswagen|ID.3|Pure|2020": { wltp: 349, bat: 58, usable: 55 },
  "Volkswagen|ID.3|Pro|2020": { wltp: 426, bat: 62, usable: 58 },
  "Volkswagen|ID.3|Pro|2021": { wltp: 426, bat: 62, usable: 58 },
  "Volkswagen|ID.3|Pro S|2021": { wltp: 553, bat: 82, usable: 77 },
  "Volkswagen|ID.3|Pro|2023": { wltp: 426, bat: 62, usable: 58 },
  "Volkswagen|ID.3|Pro S|2023": { wltp: 553, bat: 82, usable: 77 },
  "Volkswagen|ID.3|Pro|2024": { wltp: 426, bat: 62, usable: 58 },
  "Volkswagen|ID.3|Pro S|2024": { wltp: 572, bat: 82, usable: 77 },
  "Volkswagen|ID.3|GTX|2024": { wltp: 513, bat: 82, usable: 77 },

  "Volkswagen|ID.4|Pure|2021": { wltp: 345, bat: 55, usable: 52 },
  "Volkswagen|ID.4|Pro|2021": { wltp: 520, bat: 82, usable: 77 },
  "Volkswagen|ID.4|Pro|2022": { wltp: 520, bat: 82, usable: 77 },
  "Volkswagen|ID.4|Pro|2023": { wltp: 520, bat: 82, usable: 77 },
  "Volkswagen|ID.4|Pro|2024": { wltp: 530, bat: 82, usable: 77 },
  "Volkswagen|ID.4|GTX|2022": { wltp: 480, bat: 82, usable: 77 },
  "Volkswagen|ID.4|GTX|2023": { wltp: 480, bat: 82, usable: 77 },
  "Volkswagen|ID.4|GTX|2024": { wltp: 494, bat: 82, usable: 77 },

  "Volkswagen|ID.5|Pro|2022": { wltp: 532, bat: 82, usable: 77 },
  "Volkswagen|ID.5|Pro|2023": { wltp: 532, bat: 82, usable: 77 },
  "Volkswagen|ID.5|GTX|2022": { wltp: 490, bat: 82, usable: 77 },
  "Volkswagen|ID.5|GTX|2023": { wltp: 490, bat: 82, usable: 77 },

  "Volkswagen|ID.7|Pro|2024": { wltp: 621, bat: 82, usable: 77 },
  "Volkswagen|ID.7|Pro S|2024": { wltp: 709, bat: 91, usable: 86 },
  "Volkswagen|ID.7|GTX|2024": { wltp: 595, bat: 91, usable: 86 },

  "Volkswagen|ID.Buzz|Pro|2023": { wltp: 418, bat: 82, usable: 77 },
  "Volkswagen|ID.Buzz|Pro|2024": { wltp: 418, bat: 82, usable: 77 },
  "Volkswagen|ID.Buzz|LWB|2024": { wltp: 487, bat: 91, usable: 86 },

  // ── Mercedes ──
  "Mercedes|EQA|250|2021": { wltp: 426, bat: 66.5, usable: 62 },
  "Mercedes|EQA|250|2022": { wltp: 426, bat: 66.5, usable: 62 },
  "Mercedes|EQA|250+|2023": { wltp: 528, bat: 70.5, usable: 66.5 },
  "Mercedes|EQA|250+|2024": { wltp: 528, bat: 70.5, usable: 66.5 },
  "Mercedes|EQA|300 4MATIC|2024": { wltp: 480, bat: 70.5, usable: 66.5 },
  "Mercedes|EQA|350 4MATIC|2024": { wltp: 461, bat: 70.5, usable: 66.5 },

  "Mercedes|EQB|250+|2023": { wltp: 489, bat: 70.5, usable: 66.5 },
  "Mercedes|EQB|250+|2024": { wltp: 489, bat: 70.5, usable: 66.5 },
  "Mercedes|EQB|300 4MATIC|2023": { wltp: 453, bat: 70.5, usable: 66.5 },
  "Mercedes|EQB|350 4MATIC|2022": { wltp: 412, bat: 70.5, usable: 66.5 },

  "Mercedes|EQE|300|2023": { wltp: 647, bat: 96.1, usable: 89 },
  "Mercedes|EQE|350+|2023": { wltp: 620, bat: 96.1, usable: 89 },
  "Mercedes|EQE|350+|2024": { wltp: 620, bat: 96.1, usable: 89 },
  "Mercedes|EQE|43 AMG|2023": { wltp: 533, bat: 96.1, usable: 89 },
  "Mercedes|EQE|53 AMG|2023": { wltp: 518, bat: 96.1, usable: 89 },

  "Mercedes|EQS|450+|2022": { wltp: 783, bat: 120, usable: 107.8 },
  "Mercedes|EQS|450+|2023": { wltp: 783, bat: 120, usable: 107.8 },
  "Mercedes|EQS|580 4MATIC|2022": { wltp: 676, bat: 120, usable: 107.8 },
  "Mercedes|EQS|53 AMG|2022": { wltp: 586, bat: 120, usable: 107.8 },

  // ── Audi ──
  "Audi|Q4 e-tron|35|2022": { wltp: 341, bat: 55, usable: 51.5 },
  "Audi|Q4 e-tron|40|2022": { wltp: 520, bat: 82, usable: 76.6 },
  "Audi|Q4 e-tron|40|2023": { wltp: 520, bat: 82, usable: 76.6 },
  "Audi|Q4 e-tron|40|2024": { wltp: 532, bat: 82, usable: 76.6 },
  "Audi|Q4 e-tron|45|2024": { wltp: 547, bat: 82, usable: 76.6 },
  "Audi|Q4 e-tron|50|2022": { wltp: 488, bat: 82, usable: 76.6 },
  "Audi|Q4 e-tron|50|2023": { wltp: 488, bat: 82, usable: 76.6 },

  "Audi|Q6 e-tron|Performance|2024": { wltp: 641, bat: 100, usable: 94.9 },
  "Audi|Q6 e-tron|quattro|2024": { wltp: 625, bat: 100, usable: 94.9 },
  "Audi|Q6 e-tron|SQ6|2024": { wltp: 598, bat: 100, usable: 94.9 },

  "Audi|Q8 e-tron|50|2023": { wltp: 491, bat: 95, usable: 89 },
  "Audi|Q8 e-tron|55|2023": { wltp: 582, bat: 114, usable: 106 },
  "Audi|Q8 e-tron|SQ8|2023": { wltp: 494, bat: 114, usable: 106 },

  "Audi|e-tron GT|quattro|2022": { wltp: 488, bat: 93.4, usable: 85.7 },
  "Audi|e-tron GT|RS|2022": { wltp: 472, bat: 93.4, usable: 85.7 },
  "Audi|e-tron GT|quattro|2024": { wltp: 609, bat: 105, usable: 97 },
  "Audi|e-tron GT|RS|2024": { wltp: 591, bat: 105, usable: 97 },

  // ── Hyundai ──
  "Hyundai|Ioniq 5|Standard Range|2022": { wltp: 384, bat: 58, usable: 54 },
  "Hyundai|Ioniq 5|Long Range RWD|2022": { wltp: 507, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 5|Long Range AWD|2022": { wltp: 460, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 5|Long Range RWD|2023": { wltp: 507, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 5|Long Range AWD|2023": { wltp: 460, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 5|Long Range RWD|2024": { wltp: 507, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 5|Long Range AWD|2024": { wltp: 460, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 5|Long Range RWD|2025": { wltp: 570, bat: 84, usable: 79 },
  "Hyundai|Ioniq 5|Long Range AWD|2025": { wltp: 520, bat: 84, usable: 79 },
  "Hyundai|Ioniq 5|N|2024": { wltp: 448, bat: 84, usable: 79 },

  "Hyundai|Ioniq 6|Standard Range|2023": { wltp: 429, bat: 53, usable: 49 },
  "Hyundai|Ioniq 6|Long Range RWD|2023": { wltp: 614, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 6|Long Range AWD|2023": { wltp: 519, bat: 77.4, usable: 72.6 },
  "Hyundai|Ioniq 6|Long Range RWD|2024": { wltp: 614, bat: 77.4, usable: 72.6 },

  "Hyundai|Kona Electric|39 kWh|2023": { wltp: 305, bat: 39.2, usable: 37.2 },
  "Hyundai|Kona Electric|65 kWh|2023": { wltp: 490, bat: 65.4, usable: 62.4 },
  "Hyundai|Kona Electric|48 kWh|2024": { wltp: 377, bat: 48.4, usable: 46 },
  "Hyundai|Kona Electric|65 kWh|2024": { wltp: 514, bat: 65.4, usable: 62.4 },

  // ── Kia ──
  "Kia|EV6|Standard Range RWD|2022": { wltp: 394, bat: 58, usable: 54 },
  "Kia|EV6|Long Range RWD|2022": { wltp: 528, bat: 77.4, usable: 72.6 },
  "Kia|EV6|Long Range AWD|2022": { wltp: 506, bat: 77.4, usable: 72.6 },
  "Kia|EV6|Long Range RWD|2023": { wltp: 528, bat: 77.4, usable: 72.6 },
  "Kia|EV6|Long Range AWD|2023": { wltp: 506, bat: 77.4, usable: 72.6 },
  "Kia|EV6|GT|2023": { wltp: 424, bat: 77.4, usable: 72.6 },
  "Kia|EV6|Long Range RWD|2024": { wltp: 528, bat: 77.4, usable: 72.6 },
  "Kia|EV6|Long Range AWD|2024": { wltp: 506, bat: 77.4, usable: 72.6 },

  "Kia|EV9|Long Range RWD|2024": { wltp: 563, bat: 99.8, usable: 96 },
  "Kia|EV9|Long Range AWD|2024": { wltp: 512, bat: 99.8, usable: 96 },
  "Kia|EV9|GT|2025": { wltp: 479, bat: 99.8, usable: 96 },

  "Kia|Niro EV|64 kWh|2022": { wltp: 460, bat: 64.8, usable: 62 },
  "Kia|Niro EV|64 kWh|2023": { wltp: 460, bat: 64.8, usable: 62 },
  "Kia|Niro EV|64 kWh|2024": { wltp: 460, bat: 64.8, usable: 62 },

  // ── BYD ──
  "BYD|Atto 3|Standard|2023": { wltp: 420, bat: 60.5, usable: 58 },
  "BYD|Atto 3|Extended|2023": { wltp: 420, bat: 60.5, usable: 58 },
  "BYD|Dolphin|Comfort|2024": { wltp: 427, bat: 60.4, usable: 58 },
  "BYD|Dolphin|Design|2024": { wltp: 340, bat: 44.9, usable: 43.2 },
  "BYD|Seal|Design|2024": { wltp: 570, bat: 82.5, usable: 80 },
  "BYD|Seal|Excellence AWD|2024": { wltp: 520, bat: 82.5, usable: 80 },
  "BYD|Seal U|Comfort|2024": { wltp: 500, bat: 71.8, usable: 69 },
  "BYD|Seal U|Design|2024": { wltp: 500, bat: 87, usable: 83.4 },

  // ── Porsche ──
  "Porsche|Taycan|RWD|2020": { wltp: 431, bat: 93.4, usable: 79.2 },
  "Porsche|Taycan|4S|2020": { wltp: 463, bat: 93.4, usable: 83.7 },
  "Porsche|Taycan|4S|2022": { wltp: 484, bat: 93.4, usable: 83.7 },
  "Porsche|Taycan|4S|2023": { wltp: 484, bat: 93.4, usable: 83.7 },
  "Porsche|Taycan|4S|2024": { wltp: 562, bat: 105, usable: 97 },
  "Porsche|Taycan|Turbo|2020": { wltp: 452, bat: 93.4, usable: 83.7 },
  "Porsche|Taycan|Turbo|2024": { wltp: 571, bat: 105, usable: 97 },
  "Porsche|Taycan|Turbo S|2020": { wltp: 412, bat: 93.4, usable: 83.7 },
  "Porsche|Taycan|Turbo S|2024": { wltp: 557, bat: 105, usable: 97 },
  "Porsche|Taycan|GTS|2023": { wltp: 504, bat: 93.4, usable: 83.7 },

  "Porsche|Macan Electric|4|2025": { wltp: 613, bat: 100, usable: 95 },
  "Porsche|Macan Electric|Turbo|2025": { wltp: 591, bat: 100, usable: 95 },

  // ── Renault ──
  "Renault|Megane E-Tech|EV40|2022": { wltp: 300, bat: 40, usable: 37 },
  "Renault|Megane E-Tech|EV60|2022": { wltp: 450, bat: 60, usable: 56 },
  "Renault|Megane E-Tech|EV60|2023": { wltp: 450, bat: 60, usable: 56 },
  "Renault|Megane E-Tech|EV60|2024": { wltp: 450, bat: 60, usable: 56 },

  "Renault|Renault 5|Urban Range|2025": { wltp: 300, bat: 40, usable: 37 },
  "Renault|Renault 5|Comfort Range|2025": { wltp: 400, bat: 52, usable: 49 },

  // ── Skoda ──
  "Skoda|Enyaq|60|2022": { wltp: 397, bat: 62, usable: 58 },
  "Skoda|Enyaq|80|2022": { wltp: 536, bat: 82, usable: 77 },
  "Skoda|Enyaq|80|2023": { wltp: 536, bat: 82, usable: 77 },
  "Skoda|Enyaq|80|2024": { wltp: 550, bat: 82, usable: 77 },
  "Skoda|Enyaq|85|2024": { wltp: 560, bat: 82, usable: 77 },
  "Skoda|Enyaq|RS|2023": { wltp: 494, bat: 82, usable: 77 },

  "Skoda|Elroq|50|2025": { wltp: 370, bat: 55, usable: 52 },
  "Skoda|Elroq|60|2025": { wltp: 400, bat: 63, usable: 59 },
  "Skoda|Elroq|85|2025": { wltp: 560, bat: 82, usable: 77 },

  // ── Volvo ──
  "Volvo|EX30|Single Motor|2024": { wltp: 476, bat: 69, usable: 64 },
  "Volvo|EX30|Single Motor Extended|2024": { wltp: 476, bat: 69, usable: 64 },
  "Volvo|EX30|Twin Motor|2024": { wltp: 432, bat: 69, usable: 64 },
  "Volvo|EX30|Single Motor|2025": { wltp: 476, bat: 69, usable: 64 },

  "Volvo|EX40|Single Motor|2024": { wltp: 476, bat: 69, usable: 64 },
  "Volvo|EX40|Twin Motor|2024": { wltp: 438, bat: 82, usable: 79 },

  "Volvo|EX90|Single Motor|2024": { wltp: 580, bat: 111, usable: 107 },
  "Volvo|EX90|Twin Motor|2024": { wltp: 575, bat: 111, usable: 107 },

  // ── MG ──
  "MG|MG4|Standard|2023": { wltp: 350, bat: 51, usable: 49 },
  "MG|MG4|Comfort|2023": { wltp: 435, bat: 64, usable: 61.7 },
  "MG|MG4|Extended Range|2023": { wltp: 520, bat: 77, usable: 74.4 },
  "MG|MG4|XPower|2024": { wltp: 385, bat: 64, usable: 61.7 },

  "MG|MG5|Standard Range|2023": { wltp: 320, bat: 50.3, usable: 46.7 },
  "MG|MG5|Long Range|2023": { wltp: 400, bat: 61.1, usable: 57.4 },

  "MG|ZS EV|Standard Range|2023": { wltp: 320, bat: 51, usable: 49 },
  "MG|ZS EV|Long Range|2023": { wltp: 440, bat: 72.6, usable: 68.3 },

  // ── Polestar ──
  "Polestar|Polestar 2|Standard Range|2022": { wltp: 440, bat: 69, usable: 64 },
  "Polestar|Polestar 2|Long Range Single|2022": { wltp: 540, bat: 82, usable: 78 },
  "Polestar|Polestar 2|Long Range Dual|2022": { wltp: 480, bat: 82, usable: 78 },
  "Polestar|Polestar 2|Long Range Single|2024": { wltp: 635, bat: 82, usable: 79 },
  "Polestar|Polestar 2|Long Range Dual|2024": { wltp: 584, bat: 82, usable: 79 },

  "Polestar|Polestar 3|Long Range Dual|2025": { wltp: 631, bat: 111, usable: 107 },
  "Polestar|Polestar 4|Long Range Single|2025": { wltp: 620, bat: 100, usable: 94.5 },
  "Polestar|Polestar 4|Long Range Dual|2025": { wltp: 580, bat: 100, usable: 94.5 },

  // ── Cupra ──
  "Cupra|Born|58 kWh|2022": { wltp: 420, bat: 62, usable: 58 },
  "Cupra|Born|77 kWh|2022": { wltp: 548, bat: 82, usable: 77 },
  "Cupra|Born|58 kWh|2024": { wltp: 420, bat: 62, usable: 58 },
  "Cupra|Born|77 kWh|2024": { wltp: 548, bat: 82, usable: 77 },
  "Cupra|Born|VZ|2024": { wltp: 513, bat: 82, usable: 77 },

  "Cupra|Tavascan|VZ|2024": { wltp: 517, bat: 82, usable: 77 },
  "Cupra|Tavascan|Endurance|2024": { wltp: 568, bat: 82, usable: 77 },

  // ── Ford ──
  "Ford|Mustang Mach-E|Standard Range RWD|2021": { wltp: 440, bat: 75.7, usable: 68 },
  "Ford|Mustang Mach-E|Extended Range RWD|2021": { wltp: 610, bat: 98.8, usable: 88 },
  "Ford|Mustang Mach-E|Extended Range AWD|2021": { wltp: 540, bat: 98.8, usable: 88 },
  "Ford|Mustang Mach-E|GT|2022": { wltp: 490, bat: 98.8, usable: 88 },
  "Ford|Mustang Mach-E|Extended Range RWD|2024": { wltp: 600, bat: 98.8, usable: 91 },

  "Ford|Explorer Electric|Extended Range RWD|2024": { wltp: 602, bat: 82, usable: 77 },
  "Ford|Explorer Electric|Extended Range AWD|2024": { wltp: 566, bat: 82, usable: 77 },

  // ── NIO ──
  "NIO|ET5|75 kWh|2023": { wltp: 456, bat: 75, usable: 70.5 },
  "NIO|ET5|100 kWh|2023": { wltp: 590, bat: 100, usable: 93 },
  "NIO|ET7|75 kWh|2023": { wltp: 445, bat: 75, usable: 70.5 },
  "NIO|ET7|100 kWh|2023": { wltp: 580, bat: 100, usable: 93 },
  "NIO|EL6|75 kWh|2023": { wltp: 392, bat: 75, usable: 70.5 },
  "NIO|EL6|100 kWh|2023": { wltp: 517, bat: 100, usable: 93 },

  // ── Fiat ──
  "Fiat|500e|24 kWh|2021": { wltp: 190, bat: 24, usable: 21.3 },
  "Fiat|500e|42 kWh|2021": { wltp: 321, bat: 42, usable: 37.3 },
  "Fiat|500e|42 kWh|2022": { wltp: 321, bat: 42, usable: 37.3 },
  "Fiat|500e|42 kWh|2023": { wltp: 321, bat: 42, usable: 37.3 },
  "Fiat|500e|42 kWh|2024": { wltp: 331, bat: 42, usable: 37.3 },
};

/**
 * Look up WLTP data for a given make/model/variant/year.
 * Uses progressive fallback:
 * 1. Exact match: make|model|variant|year
 * 2. Without year (latest data for that variant)
 * 3. Make|model only (any variant, closest year)
 * Returns { wltp, bat, usable } or null
 */
export function getWLTP(make, model, variant, year) {
  if (!make || !model) return null;
  const v = (variant || "").trim();
  const y = String(year || "").trim();

  // 1. Exact match
  const exactKey = `${make}|${model}|${v}|${y}`;
  if (WLTP_DATA[exactKey]) return WLTP_DATA[exactKey];

  // 2. Try with empty variant + year
  const noVarKey = `${make}|${model}||${y}`;
  if (WLTP_DATA[noVarKey]) return WLTP_DATA[noVarKey];

  // 3. Fuzzy variant match — find keys starting with make|model that contain variant keywords
  const prefix = `${make}|${model}|`;
  const candidates = Object.keys(WLTP_DATA).filter(k => k.startsWith(prefix));

  if (candidates.length === 0) return null;

  // Try to match variant substring
  if (v) {
    const vLower = v.toLowerCase();
    const variantMatches = candidates.filter(k => {
      const parts = k.split("|");
      return parts[2].toLowerCase().includes(vLower) || vLower.includes(parts[2].toLowerCase());
    });

    // Among variant matches, prefer same year
    if (variantMatches.length > 0) {
      const yearMatch = variantMatches.find(k => k.endsWith(`|${y}`));
      if (yearMatch) return WLTP_DATA[yearMatch];
      // Return the latest year match
      return WLTP_DATA[variantMatches[variantMatches.length - 1]];
    }
  }

  // 4. No variant match — find closest year for any variant of this make|model
  if (y) {
    const yearNum = parseInt(y);
    let closest = null;
    let closestDiff = Infinity;
    for (const k of candidates) {
      const kYear = parseInt(k.split("|")[3]);
      const diff = Math.abs(kYear - yearNum);
      if (diff < closestDiff) { closestDiff = diff; closest = k; }
    }
    if (closest) return WLTP_DATA[closest];
  }

  // 5. Last resort — return first candidate
  return WLTP_DATA[candidates[0]] || null;
}

export default WLTP_DATA;
