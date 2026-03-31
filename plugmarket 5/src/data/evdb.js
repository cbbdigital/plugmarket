// ══════════════════════════════════════════════════════════════
// EV Intelligence Database — PlugMarket.eu
// Comprehensive specs for the "Find your perfect EV" wizard
// ══════════════════════════════════════════════════════════════
//
// Fields per car:
//   make, model, variant    — identification
//   price                   — starting price label
//   pn                      — starting price number (for filtering)
//   wltp                    — WLTP range in km
//   range_summer            — realistic summer range (highway + city mix)
//   range_winter            — realistic winter range (cold, heating on)
//   range_highway           — pure highway range at 120-130 km/h
//   battery                 — gross battery kWh
//   usable                  — usable battery kWh
//   dc_peak                 — peak DC charging power in kW
//   dc_avg                  — average DC power 10-80% in kW
//   charge_5_80_min         — minutes from 5% to 80% DC fast charge
//   charge_10_80_min        — minutes from 10% to 80% (often quoted)
//   consumption_avg         — average consumption in kWh/100km (mixed)
//   consumption_highway     — highway consumption kWh/100km at 120km/h
//   seats                   — number of seats
//   cargo_liters            — boot/trunk volume in liters
//   segment                 — "city" | "compact" | "sedan" | "suv" | "premium" | "performance"
//   use                     — "city" | "commute" | "allround" | "cruiser" | "flagship"
//   body                    — "hatchback" | "sedan" | "suv" | "coupe" | "wagon" | "mpv"
//   drivetrain              — "FWD" | "RWD" | "AWD"
//   accel_0_100             — 0-100 km/h in seconds
//   tags                    — display tags
//   strengths               — array of key strengths (used for recommendation text)
//   weaknesses              — array of trade-offs
//   trip_score              — 1-10 road trip capability (based on charging + range + network)
//   city_score              — 1-10 city suitability (size, consumption, maneuverability)
//   value_score             — 1-10 value for money
//   img                     — placeholder image URL

const FB = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=260&fit=crop";

export const EV_DB = [

  // ═══════════════ CITY / MICRO ═══════════════
  {
    make:"Dacia",model:"Spring",variant:"Electric 65",
    price:"from €22,000",pn:22000,
    wltp:230,range_summer:190,range_winter:140,range_highway:150,
    battery:26.8,usable:25,dc_peak:30,dc_avg:22,
    charge_5_80_min:56,charge_10_80_min:50,
    consumption_avg:14.5,consumption_highway:17,
    seats:4,cargo_liters:290,segment:"city",use:"city",body:"hatchback",drivetrain:"FWD",
    accel_0_100:13.7,
    tags:["City car","Most affordable"],
    strengths:["Cheapest EV in Europe","Very low running costs","Perfect city runabout"],
    weaknesses:["Very slow DC charging","Not suitable for highway trips","Small boot"],
    trip_score:1,city_score:9,value_score:10,
    img:FB,
  },
  {
    make:"Fiat",model:"500e",variant:"42 kWh",
    price:"from €24,500",pn:24500,
    wltp:321,range_summer:270,range_winter:200,range_highway:220,
    battery:42,usable:37.3,dc_peak:85,dc_avg:55,
    charge_5_80_min:30,charge_10_80_min:26,
    consumption_avg:14.5,consumption_highway:17.5,
    seats:4,cargo_liters:185,segment:"city",use:"city",body:"hatchback",drivetrain:"FWD",
    accel_0_100:9.0,
    tags:["Stylish","City icon"],
    strengths:["Iconic design","Fun to drive","Good for city + suburban"],
    weaknesses:["Small boot","2+2 seating","Limited highway range"],
    trip_score:3,city_score:10,value_score:8,
    img:"https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=260&fit=crop",
  },
  {
    make:"Smart",model:"#1",variant:"Pro+",
    price:"from €29,900",pn:29900,
    wltp:420,range_summer:350,range_winter:260,range_highway:280,
    battery:66,usable:62,dc_peak:150,dc_avg:95,
    charge_5_80_min:30,charge_10_80_min:27,
    consumption_avg:17,consumption_highway:20,
    seats:5,cargo_liters:323,segment:"compact",use:"commute",body:"suv",drivetrain:"RWD",
    accel_0_100:6.7,
    tags:["Compact SUV","Surprising range"],
    strengths:["Good range for the size","Fast charging for a small car","Modern interior"],
    weaknesses:["Premium pricing for Smart brand","Firm ride","Average boot space"],
    trip_score:5,city_score:8,value_score:6,
    img:FB,
  },

  // ═══════════════ COMPACT / VALUE ═══════════════
  {
    make:"Renault",model:"Renault 5",variant:"Comfort Range",
    price:"from €27,990",pn:27990,
    wltp:400,range_summer:340,range_winter:260,range_highway:280,
    battery:52,usable:49,dc_peak:100,dc_avg:70,
    charge_5_80_min:32,charge_10_80_min:28,
    consumption_avg:14.8,consumption_highway:18,
    seats:5,cargo_liters:277,segment:"compact",use:"commute",body:"hatchback",drivetrain:"FWD",
    accel_0_100:8.0,
    tags:["Retro icon","Value"],
    strengths:["Excellent price-to-range ratio","Charming design","Low consumption"],
    weaknesses:["Compact boot","DC charging only 100kW","Not ideal for motorway trips"],
    trip_score:4,city_score:9,value_score:9,
    img:"https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=260&fit=crop",
  },
  {
    make:"MG",model:"MG4",variant:"Extended Range 77kWh",
    price:"from €28,500",pn:28500,
    wltp:520,range_summer:430,range_winter:330,range_highway:350,
    battery:77,usable:74.4,dc_peak:144,dc_avg:95,
    charge_5_80_min:35,charge_10_80_min:31,
    consumption_avg:17,consumption_highway:20.5,
    seats:5,cargo_liters:363,segment:"compact",use:"commute",body:"hatchback",drivetrain:"RWD",
    accel_0_100:6.3,
    tags:["Best value","Long range"],
    strengths:["Incredible range for the price","Fun RWD handling","Big battery"],
    weaknesses:["Interior quality average","Slow AC charging","Brand perception"],
    trip_score:6,city_score:7,value_score:10,
    img:FB,
  },
  {
    make:"BYD",model:"Dolphin",variant:"Comfort 60kWh",
    price:"from €28,990",pn:28990,
    wltp:427,range_summer:360,range_winter:280,range_highway:300,
    battery:60.4,usable:58,dc_peak:88,dc_avg:65,
    charge_5_80_min:40,charge_10_80_min:36,
    consumption_avg:15.5,consumption_highway:19,
    seats:5,cargo_liters:345,segment:"compact",use:"commute",body:"hatchback",drivetrain:"FWD",
    accel_0_100:7.0,
    tags:["Efficient","Well equipped"],
    strengths:["Low consumption","Generous standard equipment","Smooth ride"],
    weaknesses:["DC charging below 90kW","Plain design","Limited dealer network"],
    trip_score:4,city_score:8,value_score:8,
    img:FB,
  },
  {
    make:"Peugeot",model:"e-208",variant:"GT",
    price:"from €30,900",pn:30900,
    wltp:400,range_summer:330,range_winter:250,range_highway:270,
    battery:51,usable:48.1,dc_peak:100,dc_avg:70,
    charge_5_80_min:30,charge_10_80_min:26,
    consumption_avg:15,consumption_highway:19,
    seats:5,cargo_liters:309,segment:"compact",use:"commute",body:"hatchback",drivetrain:"FWD",
    accel_0_100:8.1,
    tags:["French style","Compact"],
    strengths:["Sharp design","Good i-Cockpit interior","Nimble handling"],
    weaknesses:["Rear space tight","100kW DC max","Average boot"],
    trip_score:4,city_score:9,value_score:7,
    img:FB,
  },
  {
    make:"Peugeot",model:"e-2008",variant:"GT",
    price:"from €34,500",pn:34500,
    wltp:406,range_summer:340,range_winter:255,range_highway:275,
    battery:54,usable:50.8,dc_peak:100,dc_avg:72,
    charge_5_80_min:30,charge_10_80_min:27,
    consumption_avg:16.5,consumption_highway:20,
    seats:5,cargo_liters:434,segment:"compact",use:"commute",body:"suv",drivetrain:"FWD",
    accel_0_100:9.0,
    tags:["Compact SUV","Practical"],
    strengths:["Higher driving position","Decent boot","Good city manners"],
    weaknesses:["Slow DC charging","Not very efficient","FWD only"],
    trip_score:4,city_score:8,value_score:7,
    img:FB,
  },
  {
    make:"Opel",model:"Corsa Electric",variant:"Long Range",
    price:"from €29,900",pn:29900,
    wltp:402,range_summer:330,range_winter:250,range_highway:270,
    battery:54,usable:50.8,dc_peak:100,dc_avg:72,
    charge_5_80_min:30,charge_10_80_min:26,
    consumption_avg:15.5,consumption_highway:19.5,
    seats:5,cargo_liters:267,segment:"compact",use:"commute",body:"hatchback",drivetrain:"FWD",
    accel_0_100:8.1,
    tags:["Practical","Well-known"],
    strengths:["Familiar brand","Good urban car","Affordable running costs"],
    weaknesses:["100kW DC limit","Small boot","Conservative styling"],
    trip_score:3,city_score:8,value_score:7,
    img:FB,
  },

  // ═══════════════ COMPACT+ / MEDIUM ═══════════════
  {
    make:"Cupra",model:"Born",variant:"V3 77kWh",
    price:"from €34,800",pn:34800,
    wltp:548,range_summer:450,range_winter:340,range_highway:370,
    battery:82,usable:77,dc_peak:185,dc_avg:120,
    charge_5_80_min:29,charge_10_80_min:25,
    consumption_avg:16.5,consumption_highway:20,
    seats:5,cargo_liters:385,segment:"compact",use:"allround",body:"hatchback",drivetrain:"RWD",
    accel_0_100:6.6,
    tags:["Sporty","Fast charge"],
    strengths:["Sporty design and handling","Fast DC charging","Excellent range"],
    weaknesses:["Firm ride","Rear headroom tight","Brand still new"],
    trip_score:7,city_score:7,value_score:8,
    img:"https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=400&h=260&fit=crop",
  },
  {
    make:"Volkswagen",model:"ID.3",variant:"Pro S 82kWh",
    price:"from €36,900",pn:36900,
    wltp:572,range_summer:470,range_winter:350,range_highway:380,
    battery:82,usable:77,dc_peak:170,dc_avg:110,
    charge_5_80_min:31,charge_10_80_min:27,
    consumption_avg:16,consumption_highway:19.5,
    seats:5,cargo_liters:385,segment:"compact",use:"allround",body:"hatchback",drivetrain:"RWD",
    accel_0_100:6.7,
    tags:["Best-seller","Efficient"],
    strengths:["Excellent efficiency","Spacious interior for a compact","Huge range"],
    weaknesses:["Interior plastics feel cheap","Software can be buggy","Average AC charging"],
    trip_score:6,city_score:8,value_score:8,
    img:FB,
  },
  {
    make:"BYD",model:"Seal",variant:"Design AWD",
    price:"from €44,990",pn:44990,
    wltp:520,range_summer:430,range_winter:330,range_highway:350,
    battery:82.5,usable:80,dc_peak:150,dc_avg:100,
    charge_5_80_min:36,charge_10_80_min:32,
    consumption_avg:18,consumption_highway:22,
    seats:5,cargo_liters:400,segment:"sedan",use:"allround",body:"sedan",drivetrain:"AWD",
    accel_0_100:3.8,
    tags:["Performance","Luxury feel"],
    strengths:["Incredible acceleration","Premium interior","Competitive price for specs"],
    weaknesses:["DC charging not class-leading","Higher consumption with AWD","Dealer network growing"],
    trip_score:5,city_score:6,value_score:8,
    img:FB,
  },
  {
    make:"Skoda",model:"Enyaq",variant:"85 77kWh",
    price:"from €39,900",pn:39900,
    wltp:560,range_summer:460,range_winter:350,range_highway:370,
    battery:82,usable:77,dc_peak:175,dc_avg:115,
    charge_5_80_min:30,charge_10_80_min:26,
    consumption_avg:16.5,consumption_highway:20,
    seats:5,cargo_liters:585,segment:"suv",use:"allround",body:"suv",drivetrain:"RWD",
    accel_0_100:6.7,
    tags:["Family SUV","Huge boot"],
    strengths:["Massive boot for an EV","Comfortable ride","Good value for size"],
    weaknesses:["Not the sportiest","Infotainment learning curve","Average AC charging"],
    trip_score:7,city_score:6,value_score:8,
    img:FB,
  },
  {
    make:"Skoda",model:"Elroq",variant:"85 77kWh",
    price:"from €37,500",pn:37500,
    wltp:560,range_summer:450,range_winter:340,range_highway:365,
    battery:82,usable:77,dc_peak:175,dc_avg:115,
    charge_5_80_min:30,charge_10_80_min:26,
    consumption_avg:16.5,consumption_highway:20,
    seats:5,cargo_liters:490,segment:"compact",use:"allround",body:"suv",drivetrain:"RWD",
    accel_0_100:6.6,
    tags:["Compact SUV","Practical"],
    strengths:["Big boot for a compact SUV","Same tech as Enyaq, lower price","Good DC charging"],
    weaknesses:["New model, limited availability","Basic interior vs premium rivals"],
    trip_score:7,city_score:7,value_score:9,
    img:FB,
  },

  // ═══════════════ MEDIUM / ALL-ROUNDERS ═══════════════
  {
    make:"Tesla",model:"Model 3",variant:"Long Range AWD",
    price:"from €42,900",pn:42900,
    wltp:602,range_summer:500,range_winter:380,range_highway:410,
    battery:78.1,usable:75,dc_peak:250,dc_avg:150,
    charge_5_80_min:22,charge_10_80_min:19,
    consumption_avg:15,consumption_highway:18,
    seats:5,cargo_liters:561,segment:"sedan",use:"allround",body:"sedan",drivetrain:"AWD",
    accel_0_100:4.4,
    tags:["Fast charge king","Supercharger network"],
    strengths:["Supercharger network across Europe","Best-in-class efficiency","Very fast DC charging","Over-the-air updates"],
    weaknesses:["Polarizing interior design","No CarPlay/Android Auto","Service centers sparse"],
    trip_score:9,city_score:7,value_score:9,
    img:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=260&fit=crop",
  },
  {
    make:"Tesla",model:"Model Y",variant:"Long Range AWD",
    price:"from €52,900",pn:52900,
    wltp:568,range_summer:470,range_winter:360,range_highway:390,
    battery:81,usable:78,dc_peak:250,dc_avg:145,
    charge_5_80_min:24,charge_10_80_min:20,
    consumption_avg:16.5,consumption_highway:20,
    seats:5,cargo_liters:854,segment:"suv",use:"allround",body:"suv",drivetrain:"AWD",
    accel_0_100:5.0,
    tags:["Family SUV","Supercharger"],
    strengths:["Huge cargo space","Supercharger network","Fast charging","Best-selling EV globally"],
    weaknesses:["Ride quality can be firm","Interior minimalism not for everyone","Price has climbed"],
    trip_score:9,city_score:7,value_score:7,
    img:"https://images.unsplash.com/photo-1619317190803-58529786b291?w=400&h=260&fit=crop",
  },
  {
    make:"Hyundai",model:"Ioniq 5",variant:"Long Range AWD 84kWh",
    price:"from €48,200",pn:48200,
    wltp:520,range_summer:430,range_winter:330,range_highway:350,
    battery:84,usable:79,dc_peak:350,dc_avg:195,
    charge_5_80_min:18,charge_10_80_min:16,
    consumption_avg:18.5,consumption_highway:22,
    seats:5,cargo_liters:527,segment:"suv",use:"allround",body:"suv",drivetrain:"AWD",
    accel_0_100:5.1,
    tags:["Ultra-fast charge","V2L"],
    strengths:["800V architecture — charges 10-80% in ~16 min","Vehicle-to-Load (V2L)","Retro-futuristic design","Flat floor, spacious cabin"],
    weaknesses:["Higher consumption than rivals","No frunk","Smaller boot than Model Y"],
    trip_score:9,city_score:6,value_score:8,
    img:"https://images.unsplash.com/photo-1675255998683-a2247c4de89c?w=400&h=260&fit=crop",
  },
  {
    make:"Kia",model:"EV6",variant:"Long Range AWD",
    price:"from €49,500",pn:49500,
    wltp:506,range_summer:420,range_winter:320,range_highway:340,
    battery:77.4,usable:72.6,dc_peak:350,dc_avg:190,
    charge_5_80_min:18,charge_10_80_min:15,
    consumption_avg:18,consumption_highway:22,
    seats:5,cargo_liters:490,segment:"suv",use:"allround",body:"suv",drivetrain:"AWD",
    accel_0_100:5.2,
    tags:["Ultra-fast charge","V2L"],
    strengths:["Same 800V tech as Ioniq 5","Sportier design","V2L power outlet","Great residual values"],
    weaknesses:["Slightly less range than Ioniq 5","Higher consumption on highway","Firm sport suspension"],
    trip_score:9,city_score:6,value_score:7,
    img:"https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=400&h=260&fit=crop",
  },
  {
    make:"Volkswagen",model:"ID.4",variant:"Pro 77kWh",
    price:"from €39,900",pn:39900,
    wltp:530,range_summer:440,range_winter:330,range_highway:360,
    battery:82,usable:77,dc_peak:175,dc_avg:110,
    charge_5_80_min:31,charge_10_80_min:27,
    consumption_avg:17.5,consumption_highway:21,
    seats:5,cargo_liters:543,segment:"suv",use:"allround",body:"suv",drivetrain:"RWD",
    accel_0_100:6.7,
    tags:["Family SUV","Comfortable"],
    strengths:["Comfortable ride","Good boot space","Well-rounded for families"],
    weaknesses:["DC charging not fastest","Interior quality mixed","Software updates needed"],
    trip_score:6,city_score:6,value_score:7,
    img:FB,
  },
  {
    make:"Volkswagen",model:"ID.7",variant:"Pro S 86kWh",
    price:"from €53,000",pn:53000,
    wltp:709,range_summer:580,range_winter:440,range_highway:470,
    battery:91,usable:86,dc_peak:200,dc_avg:130,
    charge_5_80_min:28,charge_10_80_min:25,
    consumption_avg:14.5,consumption_highway:17.5,
    seats:5,cargo_liters:532,segment:"sedan",use:"cruiser",body:"sedan",drivetrain:"RWD",
    accel_0_100:6.5,
    tags:["Ultra range","Autobahn cruiser"],
    strengths:["700+ km WLTP — one of the longest range EVs","Incredibly efficient","Spacious saloon","Quiet and comfortable"],
    weaknesses:["Not sporty","DC charging could be faster for the battery size","Conservative design"],
    trip_score:8,city_score:5,value_score:7,
    img:FB,
  },
  {
    make:"Ford",model:"Mustang Mach-E",variant:"Extended Range RWD",
    price:"from €49,900",pn:49900,
    wltp:600,range_summer:490,range_winter:370,range_highway:400,
    battery:98.8,usable:91,dc_peak:150,dc_avg:100,
    charge_5_80_min:43,charge_10_80_min:38,
    consumption_avg:18,consumption_highway:22,
    seats:5,cargo_liters:402,segment:"suv",use:"allround",body:"suv",drivetrain:"RWD",
    accel_0_100:6.2,
    tags:["Muscle EV","Big battery"],
    strengths:["Iconic Mustang styling","Huge battery = long range","Fun to drive"],
    weaknesses:["Slow DC charging for the battery size","Heavy","Ford software reliability mixed"],
    trip_score:5,city_score:5,value_score:6,
    img:FB,
  },
  {
    make:"Cupra",model:"Tavascan",variant:"Endurance 77kWh",
    price:"from €47,900",pn:47900,
    wltp:568,range_summer:460,range_winter:350,range_highway:380,
    battery:82,usable:77,dc_peak:185,dc_avg:120,
    charge_5_80_min:29,charge_10_80_min:25,
    consumption_avg:17,consumption_highway:20,
    seats:5,cargo_liters:540,segment:"suv",use:"allround",body:"suv",drivetrain:"RWD",
    accel_0_100:6.8,
    tags:["Coupe SUV","Sporty design"],
    strengths:["Head-turning design","Good range","Fast DC charging"],
    weaknesses:["Coupe roofline limits rear headroom","Higher price than Born","New model, unproven"],
    trip_score:7,city_score:6,value_score:7,
    img:FB,
  },

  // ═══════════════ LARGE SUV ═══════════════
  {
    make:"Kia",model:"EV9",variant:"Long Range AWD",
    price:"from €72,900",pn:72900,
    wltp:512,range_summer:420,range_winter:320,range_highway:340,
    battery:99.8,usable:96,dc_peak:350,dc_avg:200,
    charge_5_80_min:20,charge_10_80_min:17,
    consumption_avg:22,consumption_highway:26,
    seats:7,cargo_liters:333,segment:"suv",use:"allround",body:"suv",drivetrain:"AWD",
    accel_0_100:5.3,
    tags:["7-seater","Ultra-fast charge"],
    strengths:["True 7-seater EV","800V ultra-fast charging","Imposing presence","V2L"],
    weaknesses:["Heavy — consumption high","Expensive","Third row only for kids"],
    trip_score:8,city_score:4,value_score:5,
    img:FB,
  },
  {
    make:"Tesla",model:"Model X",variant:"Long Range",
    price:"from €99,900",pn:99900,
    wltp:576,range_summer:470,range_winter:360,range_highway:380,
    battery:100,usable:95,dc_peak:250,dc_avg:150,
    charge_5_80_min:28,charge_10_80_min:24,
    consumption_avg:20,consumption_highway:24,
    seats:7,cargo_liters:2614,segment:"premium",use:"cruiser",body:"suv",drivetrain:"AWD",
    accel_0_100:3.9,
    tags:["7-seater","Falcon doors"],
    strengths:["Falcon wing doors","Huge cargo","Supercharger network","Fast and spacious"],
    weaknesses:["Extremely expensive","Complex doors can break","Heavy vehicle"],
    trip_score:8,city_score:4,value_score:3,
    img:"https://images.unsplash.com/photo-1619317190803-58529786b291?w=400&h=260&fit=crop",
  },

  // ═══════════════ PREMIUM / CRUISER ═══════════════
  {
    make:"BMW",model:"i4",variant:"eDrive40",
    price:"from €52,500",pn:52500,
    wltp:590,range_summer:490,range_winter:370,range_highway:400,
    battery:83.9,usable:80.7,dc_peak:210,dc_avg:130,
    charge_5_80_min:28,charge_10_80_min:24,
    consumption_avg:16,consumption_highway:19,
    seats:5,cargo_liters:470,segment:"sedan",use:"allround",body:"sedan",drivetrain:"RWD",
    accel_0_100:5.7,
    tags:["Premium sedan","Efficient"],
    strengths:["BMW driving dynamics","Good efficiency","Premium build quality"],
    weaknesses:["Controversial grille design","No dedicated EV platform","Average boot access"],
    trip_score:7,city_score:6,value_score:6,
    img:FB,
  },
  {
    make:"BMW",model:"iX",variant:"xDrive50",
    price:"from €68,500",pn:68500,
    wltp:630,range_summer:520,range_winter:400,range_highway:420,
    battery:111.5,usable:105.2,dc_peak:195,dc_avg:130,
    charge_5_80_min:35,charge_10_80_min:31,
    consumption_avg:20,consumption_highway:24,
    seats:5,cargo_liters:500,segment:"premium",use:"cruiser",body:"suv",drivetrain:"AWD",
    accel_0_100:4.6,
    tags:["Premium SUV","Longest range"],
    strengths:["Huge battery = massive range","Ultra-luxury interior","Quiet and comfortable","Advanced tech"],
    weaknesses:["Divisive exterior design","Expensive","DC charging not fastest for battery size"],
    trip_score:8,city_score:5,value_score:5,
    img:"https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=260&fit=crop",
  },
  {
    make:"Mercedes",model:"EQE",variant:"350+",
    price:"from €62,000",pn:62000,
    wltp:620,range_summer:510,range_winter:390,range_highway:410,
    battery:96.1,usable:89,dc_peak:170,dc_avg:115,
    charge_5_80_min:34,charge_10_80_min:30,
    consumption_avg:17.5,consumption_highway:21,
    seats:5,cargo_liters:430,segment:"premium",use:"cruiser",body:"sedan",drivetrain:"RWD",
    accel_0_100:6.4,
    tags:["Luxury","Ultra range"],
    strengths:["Mercedes luxury and comfort","Excellent range","MBUX Hyperscreen option","Whisper quiet"],
    weaknesses:["DC charging slower than rivals","High price","Complex infotainment"],
    trip_score:7,city_score:5,value_score:5,
    img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=260&fit=crop",
  },
  {
    make:"Mercedes",model:"EQS",variant:"450+",
    price:"from €109,000",pn:109000,
    wltp:783,range_summer:640,range_winter:480,range_highway:520,
    battery:120,usable:107.8,dc_peak:200,dc_avg:135,
    charge_5_80_min:35,charge_10_80_min:31,
    consumption_avg:16.5,consumption_highway:20,
    seats:5,cargo_liters:610,segment:"premium",use:"flagship",body:"sedan",drivetrain:"RWD",
    accel_0_100:6.2,
    tags:["Flagship","Record range"],
    strengths:["Longest range EV in the world (783km WLTP)","Ultimate luxury","Hyperscreen dashboard","Near-silent"],
    weaknesses:["Extremely expensive","Heavy","DC charging not proportional to battery size"],
    trip_score:8,city_score:4,value_score:3,
    img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=260&fit=crop",
  },

  // ═══════════════ PERFORMANCE / GT ═══════════════
  {
    make:"Porsche",model:"Taycan",variant:"4S (2024+)",
    price:"from €89,000",pn:89000,
    wltp:562,range_summer:460,range_winter:350,range_highway:380,
    battery:105,usable:97,dc_peak:320,dc_avg:220,
    charge_5_80_min:20,charge_10_80_min:17,
    consumption_avg:20,consumption_highway:24,
    seats:4,cargo_liters:407,segment:"performance",use:"cruiser",body:"sedan",drivetrain:"AWD",
    accel_0_100:3.7,
    tags:["Performance GT","Phenomenal charging"],
    strengths:["5-80% in ~20 min — incredible charging curve","Porsche driving dynamics","800V architecture","Can cruise 1000km+ per day easily","Built for the Autobahn"],
    weaknesses:["Expensive","4 seats only","Higher consumption"],
    trip_score:10,city_score:5,value_score:5,
    img:"https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=400&h=260&fit=crop",
  },
  {
    make:"Porsche",model:"Taycan",variant:"Turbo S (2024+)",
    price:"from €189,000",pn:189000,
    wltp:557,range_summer:450,range_winter:340,range_highway:370,
    battery:105,usable:97,dc_peak:320,dc_avg:220,
    charge_5_80_min:20,charge_10_80_min:17,
    consumption_avg:22,consumption_highway:26,
    seats:4,cargo_liters:407,segment:"performance",use:"flagship",body:"sedan",drivetrain:"AWD",
    accel_0_100:2.4,
    tags:["Supercar fast","GT flagship"],
    strengths:["0-100 in 2.4s","Same phenomenal charging as 4S","Track-capable","Ultimate electric GT"],
    weaknesses:["Nearly €200k","Harsh ride on sport springs","Impractical as daily"],
    trip_score:10,city_score:3,value_score:2,
    img:"https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=400&h=260&fit=crop",
  },
  {
    make:"Porsche",model:"Macan Electric",variant:"4",
    price:"from €78,000",pn:78000,
    wltp:613,range_summer:500,range_winter:380,range_highway:410,
    battery:100,usable:95,dc_peak:270,dc_avg:185,
    charge_5_80_min:22,charge_10_80_min:19,
    consumption_avg:18.5,consumption_highway:22,
    seats:5,cargo_liters:540,segment:"premium",use:"cruiser",body:"suv",drivetrain:"AWD",
    accel_0_100:5.2,
    tags:["Sport SUV","Fast charge"],
    strengths:["Porsche handling in SUV form","800V fast charging","Great range","Practical daily"],
    weaknesses:["Expensive","Not as fast-charging as Taycan","Premium fuel for the segment"],
    trip_score:9,city_score:6,value_score:5,
    img:"https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=400&h=260&fit=crop",
  },
  {
    make:"Tesla",model:"Model S",variant:"Long Range",
    price:"from €89,900",pn:89900,
    wltp:634,range_summer:520,range_winter:400,range_highway:420,
    battery:100,usable:95,dc_peak:250,dc_avg:155,
    charge_5_80_min:27,charge_10_80_min:23,
    consumption_avg:18,consumption_highway:21,
    seats:5,cargo_liters:793,segment:"premium",use:"cruiser",body:"sedan",drivetrain:"AWD",
    accel_0_100:3.2,
    tags:["Flagship sedan","Supercharger"],
    strengths:["Supercharger network","Huge range","Massive cargo","Gaming-capable screen"],
    weaknesses:["Yoke steering controversial","No instrument cluster","Very expensive"],
    trip_score:9,city_score:5,value_score:4,
    img:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=260&fit=crop",
  },

  // ═══════════════ WAGONS / ESTATES ═══════════════
  {
    make:"Volkswagen",model:"ID.7 Tourer",variant:"Pro S",
    price:"from €56,000",pn:56000,
    wltp:690,range_summer:560,range_winter:430,range_highway:460,
    battery:91,usable:86,dc_peak:200,dc_avg:130,
    charge_5_80_min:28,charge_10_80_min:25,
    consumption_avg:15,consumption_highway:18,
    seats:5,cargo_liters:605,segment:"sedan",use:"cruiser",body:"wagon",drivetrain:"RWD",
    accel_0_100:6.5,
    tags:["Estate","Ultra range"],
    strengths:["Estate body = huge boot","Near-700km range","Very efficient","Perfect family tourer"],
    weaknesses:["Not sporty","Slow DC for battery size","VW software quirks"],
    trip_score:8,city_score:5,value_score:7,
    img:FB,
  },

  // ═══════════════ CHINESE / NEW BRANDS ═══════════════
  {
    make:"BYD",model:"Atto 3",variant:"Comfort",
    price:"from €33,990",pn:33990,
    wltp:420,range_summer:350,range_winter:260,range_highway:280,
    battery:60.5,usable:58,dc_peak:88,dc_avg:62,
    charge_5_80_min:42,charge_10_80_min:38,
    consumption_avg:17,consumption_highway:21,
    seats:5,cargo_liters:440,segment:"compact",use:"commute",body:"suv",drivetrain:"FWD",
    accel_0_100:7.3,
    tags:["Value SUV","Well equipped"],
    strengths:["Generous equipment for the price","Comfortable ride","Good boot space"],
    weaknesses:["Very slow DC charging","Conservative styling","Heavy for its size"],
    trip_score:3,city_score:7,value_score:7,
    img:FB,
  },
  {
    make:"BYD",model:"Seal U",variant:"Comfort 71kWh",
    price:"from €41,990",pn:41990,
    wltp:500,range_summer:410,range_winter:310,range_highway:330,
    battery:71.8,usable:69,dc_peak:140,dc_avg:90,
    charge_5_80_min:34,charge_10_80_min:30,
    consumption_avg:17.5,consumption_highway:21.5,
    seats:5,cargo_liters:425,segment:"suv",use:"allround",body:"suv",drivetrain:"FWD",
    accel_0_100:7.5,
    tags:["Midsize SUV","Well equipped"],
    strengths:["Good space for a family SUV","Competitive pricing","Full equipment"],
    weaknesses:["DC charging average","Not very exciting to drive","Brand still building trust"],
    trip_score:5,city_score:6,value_score:7,
    img:FB,
  },
  {
    make:"NIO",model:"ET7",variant:"100 kWh",
    price:"from €69,900",pn:69900,
    wltp:580,range_summer:470,range_winter:360,range_highway:380,
    battery:100,usable:93,dc_peak:240,dc_avg:145,
    charge_5_80_min:28,charge_10_80_min:24,
    consumption_avg:19,consumption_highway:23,
    seats:5,cargo_liters:386,segment:"premium",use:"cruiser",body:"sedan",drivetrain:"AWD",
    accel_0_100:3.8,
    tags:["Battery swap","Premium"],
    strengths:["Battery swap in 5 min","Premium interior rivaling Mercedes","Fast and comfortable"],
    weaknesses:["Limited swap station network in EU","Expensive","Brand awareness low"],
    trip_score:7,city_score:5,value_score:4,
    img:FB,
  },

  // ═══════════════ VOLVO ═══════════════
  {
    make:"Volvo",model:"EX30",variant:"Single Motor Extended",
    price:"from €36,200",pn:36200,
    wltp:476,range_summer:400,range_winter:300,range_highway:320,
    battery:69,usable:64,dc_peak:153,dc_avg:100,
    charge_5_80_min:28,charge_10_80_min:24,
    consumption_avg:16,consumption_highway:20,
    seats:5,cargo_liters:318,segment:"compact",use:"commute",body:"suv",drivetrain:"RWD",
    accel_0_100:5.3,
    tags:["Compact premium","Safe"],
    strengths:["Premium feel at a good price","Volvo safety","Fast for a compact","Sustainable materials"],
    weaknesses:["Small boot","Limited rear space","All controls through screen"],
    trip_score:6,city_score:8,value_score:8,
    img:"https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=400&h=260&fit=crop",
  },
  {
    make:"Volvo",model:"EX90",variant:"Twin Motor",
    price:"from €83,000",pn:83000,
    wltp:575,range_summer:470,range_winter:360,range_highway:380,
    battery:111,usable:107,dc_peak:250,dc_avg:160,
    charge_5_80_min:30,charge_10_80_min:26,
    consumption_avg:22,consumption_highway:26,
    seats:7,cargo_liters:310,segment:"premium",use:"cruiser",body:"suv",drivetrain:"AWD",
    accel_0_100:4.9,
    tags:["7-seater luxury","Safe"],
    strengths:["Most advanced safety tech (LiDAR)","True 7-seater","Premium interior","Huge battery"],
    weaknesses:["Very heavy","Expensive","Software delays at launch"],
    trip_score:7,city_score:4,value_score:4,
    img:FB,
  },

  // ═══════════════ POLESTAR ═══════════════
  {
    make:"Polestar",model:"Polestar 2",variant:"Long Range Single Motor",
    price:"from €46,900",pn:46900,
    wltp:635,range_summer:520,range_winter:400,range_highway:420,
    battery:82,usable:79,dc_peak:205,dc_avg:130,
    charge_5_80_min:27,charge_10_80_min:23,
    consumption_avg:15.5,consumption_highway:18.5,
    seats:5,cargo_liters:405,segment:"sedan",use:"allround",body:"sedan",drivetrain:"RWD",
    accel_0_100:6.2,
    tags:["Scandinavian design","Efficient"],
    strengths:["Very efficient","Clean minimalist design","Google built-in","Good range"],
    weaknesses:["Boot not the biggest","Brand still niche","Resale values uncertain"],
    trip_score:7,city_score:7,value_score:7,
    img:FB,
  },

  // ═══════════════ AUDI ═══════════════
  {
    make:"Audi",model:"Q4 e-tron",variant:"45 77kWh",
    price:"from €45,000",pn:45000,
    wltp:547,range_summer:450,range_winter:340,range_highway:370,
    battery:82,usable:76.6,dc_peak:175,dc_avg:115,
    charge_5_80_min:29,charge_10_80_min:25,
    consumption_avg:17,consumption_highway:20.5,
    seats:5,cargo_liters:520,segment:"suv",use:"allround",body:"suv",drivetrain:"RWD",
    accel_0_100:6.7,
    tags:["Premium compact SUV","Badge"],
    strengths:["Audi premium badge","Good range","Practical size","Nice interior"],
    weaknesses:["DC not class-leading","MEB platform shared with cheaper VW","Pricey options"],
    trip_score:6,city_score:6,value_score:6,
    img:FB,
  },
  {
    make:"Audi",model:"Q6 e-tron",variant:"quattro",
    price:"from €65,000",pn:65000,
    wltp:625,range_summer:510,range_winter:390,range_highway:420,
    battery:100,usable:94.9,dc_peak:270,dc_avg:180,
    charge_5_80_min:22,charge_10_80_min:19,
    consumption_avg:18.5,consumption_highway:22,
    seats:5,cargo_liters:526,segment:"premium",use:"cruiser",body:"suv",drivetrain:"AWD",
    accel_0_100:5.9,
    tags:["Premium SUV","Fast charge"],
    strengths:["PPE platform — proper fast charging","Premium Audi quality","Great range","800V architecture"],
    weaknesses:["Expensive","Heavy","Complex infotainment"],
    trip_score:8,city_score:5,value_score:5,
    img:FB,
  },
  {
    make:"Audi",model:"e-tron GT",variant:"RS (2024+)",
    price:"from €152,000",pn:152000,
    wltp:591,range_summer:480,range_winter:360,range_highway:390,
    battery:105,usable:97,dc_peak:320,dc_avg:220,
    charge_5_80_min:20,charge_10_80_min:17,
    consumption_avg:21,consumption_highway:25,
    seats:4,cargo_liters:405,segment:"performance",use:"flagship",body:"sedan",drivetrain:"AWD",
    accel_0_100:2.5,
    tags:["Supercar","RS performance"],
    strengths:["Shares Taycan platform — phenomenal charging","RS performance credentials","Stunning design"],
    weaknesses:["Over €150k","4 seats","High consumption"],
    trip_score:10,city_score:3,value_score:2,
    img:FB,
  },

  // ═══════════════ MG ═══════════════
  {
    make:"MG",model:"ZS EV",variant:"Long Range",
    price:"from €31,990",pn:31990,
    wltp:440,range_summer:360,range_winter:270,range_highway:290,
    battery:72.6,usable:68.3,dc_peak:92,dc_avg:65,
    charge_5_80_min:46,charge_10_80_min:42,
    consumption_avg:18.5,consumption_highway:23,
    seats:5,cargo_liters:470,segment:"compact",use:"commute",body:"suv",drivetrain:"FWD",
    accel_0_100:8.6,
    tags:["Budget SUV","Practical"],
    strengths:["Affordable family SUV","Decent boot","Good equipment level"],
    weaknesses:["Very slow DC charging","Not efficient","Handling basic"],
    trip_score:3,city_score:7,value_score:7,
    img:FB,
  },

  // ═══════════════ RENAULT ═══════════════
  {
    make:"Renault",model:"Megane E-Tech",variant:"EV60",
    price:"from €37,900",pn:37900,
    wltp:450,range_summer:370,range_winter:280,range_highway:300,
    battery:60,usable:56,dc_peak:130,dc_avg:85,
    charge_5_80_min:29,charge_10_80_min:26,
    consumption_avg:15.5,consumption_highway:19,
    seats:5,cargo_liters:440,segment:"compact",use:"commute",body:"hatchback",drivetrain:"FWD",
    accel_0_100:7.4,
    tags:["Efficient hatch","Good interior"],
    strengths:["Very low consumption","Good interior with Google built-in","Comfortable ride"],
    weaknesses:["DC charging average","Range doesn't match bigger batteries","Rear space tight"],
    trip_score:5,city_score:8,value_score:7,
    img:FB,
  },
  {
    make:"Renault",model:"Scenic E-Tech",variant:"Long Range",
    price:"from €41,900",pn:41900,
    wltp:625,range_summer:510,range_winter:380,range_highway:410,
    battery:87,usable:82,dc_peak:150,dc_avg:100,
    charge_5_80_min:37,charge_10_80_min:33,
    consumption_avg:16,consumption_highway:19.5,
    seats:5,cargo_liters:545,segment:"suv",use:"allround",body:"mpv",drivetrain:"FWD",
    accel_0_100:7.9,
    tags:["Family MPV","Huge range"],
    strengths:["625km WLTP at a good price","Spacious family car","Low consumption","Comfortable"],
    weaknesses:["DC charging slow for battery size","FWD only","Not sporty"],
    trip_score:6,city_score:6,value_score:8,
    img:FB,
  },
];

/**
 * Calculate how many km a car can add per minute of DC charging (10-80%)
 */
export function kmPerMinCharge(car) {
  if (!car.charge_10_80_min || !car.range_highway) return 0;
  const kmAdded = car.range_highway * 0.7; // 10% to 80% = 70% of highway range
  return Math.round(kmAdded / car.charge_10_80_min);
}

/**
 * Calculate 1000km trip: how many stops and total charge time
 */
export function tripCalc(car, distanceKm) {
  if (!car.range_highway || !car.charge_10_80_min) return null;
  const legKm = car.range_highway * 0.7; // usable per stop (10-80%)
  const firstLeg = car.range_highway * 0.8; // start at 80%
  let remaining = distanceKm - firstLeg;
  let stops = 0;
  let totalChargeMin = 0;
  while (remaining > 0) {
    stops++;
    totalChargeMin += car.charge_10_80_min;
    remaining -= legKm;
  }
  return { stops, totalChargeMin, kmPerMin: kmPerMinCharge(car) };
}

/**
 * Calculate weekly charges needed
 */
export function weeklyCharges(car, yearlyKm) {
  const weeklyKm = yearlyKm / 52;
  return Math.ceil(weeklyKm / (car.range_summer || car.wltp || 300));
}

/**
 * Generate recommendation text based on user preferences
 */
export function getRecommendationText(car, yearlyKm, longTrips) {
  const parts = [];
  const wc = weeklyCharges(car, yearlyKm);

  if (wc <= 1) parts.push(`${car.range_summer || car.wltp}km range covers your full week on a single charge.`);
  else parts.push(`You'll charge ~${wc}x per week.`);

  if (longTrips === "often" || longTrips === "sometimes") {
    const dist = longTrips === "often" ? 1000 : 500;
    const trip = tripCalc(car, dist);
    if (trip) {
      parts.push(`${dist}km trip: ${trip.stops} stop${trip.stops > 1 ? "s" : ""}, ~${trip.totalChargeMin} min total charging.`);
      if (trip.kmPerMin >= 20) parts.push("Exceptional road trip capability.");
      else if (trip.kmPerMin >= 14) parts.push("Good road trip car.");
      else if (trip.kmPerMin >= 8) parts.push("OK for occasional trips, not ideal for frequent long drives.");
      else parts.push("Better suited for daily driving than long trips.");
    }
  }

  if (car.dc_peak >= 300) parts.push(`${car.dc_peak}kW peak — ultra-fast 800V charging.`);
  else if (car.dc_peak >= 200) parts.push(`${car.dc_peak}kW peak — fast charging.`);
  else if (car.dc_peak >= 150) parts.push(`${car.dc_peak}kW peak — decent DC speed.`);
  else if (car.dc_peak < 100) parts.push(`${car.dc_peak}kW DC — slow, plan for longer stops.`);

  if (car.consumption_avg <= 15) parts.push("One of the most efficient EVs available.");
  if (car.cargo_liters >= 550) parts.push("Excellent boot space for families.");
  if (car.seats >= 7) parts.push("True 7-seater — rare in EVs.");

  const vpk = ((car.range_summer || car.wltp) / (car.pn / 1000)).toFixed(1);
  parts.push(`${vpk} km per €1,000 — ${parseFloat(vpk) > 12 ? "excellent" : parseFloat(vpk) > 8 ? "good" : "average"} value.`);

  return parts.join(" ");
}

export default EV_DB;
