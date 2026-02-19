"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MapPin, User, Building2, Phone, Package, ArrowLeft, ShoppingBag, AlertCircle, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";
import Image from "next/image";
import { validateAddress, validateAddressField, isValidPhoneNumber, type AddressValidationResult } from "@/lib/address-validation";

interface ShippingFormData {
  country: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface FieldErrors {
  [key: string]: string | null;
}

interface FieldWarnings {
  [key: string]: string | null;
}

// Cities by country for autcomplete
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "United States": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Las Vegas", "Memphis", "Boston", "Seattle", "Denver",
    "Miami", "Atlanta", "Portland", "Detroit", "Minneapolis", "Nashville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson",
    "Fresno", "Long Beach", "Kansas City", "Oakland", "Tulsa", "Arlington", "New Orleans", "Bakersfield", "Tampa", "Aurora",
    "Anaheim", "Santa Ana", "St. Louis", "Riverside", "Corpus Christi", "Lexington", "Henderson", "Plano", "Stockton", "Cincinnati"
  ],
  "Canada": [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
    "London", "St. Catharines", "Halifax", "Windsor", "Saskatoon", "Barrie", "Kingston", "Thunder Bay", "Sudbury", "Sherbrooke"
  ],
  "United Kingdom": [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Edinburgh", "Liverpool", "Bristol", "York", "Oxford",
    "Cambridge", "Bath", "Canterbury", "Windsor", "Chester", "Nottingham", "Sheffield", "Bradford", "Hull", "Derby"
  ],
  "Australia": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City",
    "Hobart", "Fremantle", "Geelong", "Townsville", "Cairns", "Toowoomba", "Darwin", "Launceston", "Albury", "Ballarat"
  ],
  "Germany": [
    "Berlin", "Munich", "Cologne", "Frankfurt", "Hamburg", "Dusseldorf", "Dortmund", "Essen", "Leipzig", "Dresden",
    "Hannover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Mannheim", "Karlsruhe", "Stuttgart"
  ],
  "France": [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
    "Reims", "Le Havre", "Saint-Etienne", "Toulon", "Grenoble", "Angers", "Villeurbanne", "Nimes", "Aix-en-Provence", "Brest"
  ],
  "Spain": [
    "Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Malaga", "Murcia", "Palma", "Las Palmas", "Alicante",
    "Cordoba", "Valladolid", "Zaragoza", "Gijon", "Toledo", "Salamanca", "Pamplona", "Almeria", "Avila", "Burgos"
  ],
  "Italy": [
    "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania",
    "Venice", "Verona", "Messina", "Padua", "Trieste", "Brescia", "Parma", "Pisa", "Reggio Calabria", "Ancona"
  ],
  "Netherlands": [
    "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Almere", "Breda", "Nijmegen", "Enschede",
    "Haarlem", "Arnhem", "Zaanstad", "Apeldoorn", "Tilburg", "Dordrecht", "Leiden", "Maastricht", "Zwolle", "Deventer"
  ],
  "Belgium": [
    "Brussels", "Antwerp", "Ghent", "Charleroi", "Liege", "Bruges", "Namur", "Leuven", "Mons", "Tournai",
    "Ostend", "Mechelen", "Hasselt", "Verviers", "Waterloo", "Kortrijk", "Arlon", "Seraing", "Nivelles", "Waremme"
  ],
  "Switzerland": [
    "Zurich", "Bern", "Basel", "Lausanne", "Geneva", "Biel", "St. Gallen", "Lucerne", "Uri", "Winterthur",
    "Lugano", "Fribourg", "Sion", "Neuchatel", "Schaffhausen", "Thun", "Solothurn", "Liestal", "Glarus", "Zug"
  ],
  "Austria": [
    "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "St. Polten", "Steyr",
    "Eisenstadt", "Feldkirch", "Bregenz", "Dornbirn", "Hallein", "Wörgl", "Kapfenberg", "Leoben", "Traun", "Amstetten"
  ],
  "Sweden": [
    "Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras", "Orebro", "Linkoping", "Helsingborg", "Jonkoping", "Norrkoping",
    "Lund", "Umea", "Gavle", "Sundsvall", "Halmstad", "Vasterviki", "Visby", "Sodertalje", "Trollhattan", "Uddevalla"
  ],
  "Norway": [
    "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Lillehammer", "Gjovik", "Sandefjord", "Tonsberg",
    "Sarpsborg", "Kristiansand", "Arendal", "Skien", "Porsgrunn", "Hamar", "Elverum", "Steinkjer", "Bodø", "Tromso"
  ],
  "Denmark": [
    "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Silkeborg",
    "Herning", "Hellerup", "Birkerod", "Farum", "Roskilde", "Lolland", "Naestved", "Koge", "Helsingor", "Svendborg"
  ],
  "Finland": [
    "Helsinki", "Espoo", "Tampere", "Vantaa", "Turku", "Oulu", "Jyvaskyla", "Lahti", "Kuopio", "Pori",
    "Vaasa", "Salo", "Lappeenranta", "Kouvola", "Joensuu", "Hyvinkaa", "Rovaniemi", "Rauma", "Raisio", "Turku"
  ],
  "Portugal": [
    "Lisbon", "Porto", "Braga", "Covilha", "Aveiro", "Funchal", "Guarda", "Covilha", "Leiria", "Castelo Branco",
    "Viseu", "Evora", "Beja", "Portalegre", "Faro", "Ponta Delgada", "Angra do Heroísmo", "Santarem", "Caldas da Rainha", "Nazare"
  ],
  "Japan": [
    "Tokyo", "Yokohama", "Osaka", "Kobe", "Kyoto", "Kawasaki", "Saitama", "Hiroshima", "Yonago", "Fukuoka",
    "Kita-Kyushu", "Sapporo", "Sendai", "Nagoya", "Okinawa", "Nagasaki", "Okayama", "Shizuoka", "Matsuyama", "Kagoshima"
  ],
  "China": [
    "Beijing", "Shanghai", "Chongqing", "Guangzhou", "Shenzhen", "Chengdu", "Wuhan", "Xi'an", "Hangzhou", "Nanjing",
    "Tianjin", "Shenyang", "Jinan", "Qingdao", "Changchun", "Suzhou", "Harbin", "Zhengzhou", "Taiyuan", "Lanzhou"
  ],
  "South Korea": [
    "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan", "Suuwon", "Seongnam", "Goyang",
    "Ansan", "Bucheon", "Gimhae", "Changwon", "Jeonju", "Pohang", "Jeju", "Icheon", "Gwacheon", "Anyang"
  ],
  "India": [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Chandigarh", "Surat", "Indore", "Kanpur", "Nagpur", "Thane", "Bhopal", "Visakhapatnam", "Pimpri", "Patna"
  ],
  "Thailand": [
    "Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Chiang Rai", "Koh Samui", "Nakhon Ratchasima", "Udon Thani", "Rayong", "Sukhothai",
    "Hua Hin", "Nakhon Si Thammarat", "Songkhla", "Phrae", "Yasothon", "Loei", "Chaiyaphum", "Sakon Nakhon", "Roi Et", "Khon Kaen"
  ],
  "Mexico": [
    "Mexico City", "Guadalajara", "Ecatepec", "Monterrey", "Puebla", "Juarez", "Tijuana", "Leon", "Zapopan", "Querétaro",
    "Cancun", "Acapulco", "Veracruz", "Merida", "Aguascalientes", "Culiacan", "Hermosillo", "Chihuahua", "Playa del Carmen", "Puerto Vallarta"
  ],
  "Brazil": [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Goiânia",
    "Belém", "Guarulhos", "Campinas", "São Gonçalo", "Maceió", "Duque de Caxias", "Santo André", "Ananindeua", "Osasco", "Sorocaba"
  ],
  "Saudi Arabia": [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Ar Riyad", "Abha", "Tabuk", "Hufuf", "Khamis Mushait",
    "Yanbu", "Jizan", "Sakaka", "Bisha", "Arar", "Qaisumah", "Haradh", "Jubail", "Khobar", "Dhahran"
  ],
  "South Africa": [
    "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Pietermaritzburg", "East London", "Polokwane", "Rustenburg",
    "Benoni", "Vereeniging", "Botshabelo", "Mafikeng", "Mthatha", "Sasolburg", "Kempton Park", "Vanderbijlpark", "Springs", "Boksburg"
  ],
  "New Zealand": [
    "Auckland", "Wellington", "Christchurch", "Dunedin", "Hamilton", "Whangarei", "Rotorua", "Invercargill", "Gisborne", "New Plymouth",
    "Napier", "Hastings", "Nelson", "Palmerston North", "Whangarei", "Timaru", "Oamaru", "Runanga", "Leigh", "Kerikeri"
  ],
  "Singapore": [
    "Singapore"
  ],
  "Greece": [
    "Athens", "Thessaloniki", "Patras", "Larissa", "Volos", "Ioannina", "Trikala", "Katerini", "Kalamata", "Corinth"
  ],
  "Poland": [
    "Warsaw", "Krakow", "Wroclaw", "Poznan", "Gdansk", "Lodz", "Szczecin", "Bydgoszcz", "Lublin", "Katowice",
    "Radom", "Kielce", "Torun", "Gliwice", "Zabrze", "Bytom", "Rybnik", "Tychy", "Oswiecim", "Zakopane"
  ],
  "Czechia": [
    "Prague", "Brno", "Ostrava", "Plzen", "Liberec", "Olomouc", "Usti nad Labem", "Jihlavá", "Ceske Budejovice", "Zlin",
    "Kladno", "Havlickuv Brod", "Opava", "Cheb", "Trutnov", "Sumperk", "Frydek-Mistek", "Varnsdorf", "Chomutov", "Teplice"
  ],
  "Ireland": [
    "Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Kilkenny", "Tralee", "Sligo",
    "Wexford", "Carlow", "Naas", "Athlone", "Westport", "Ennis", "Letterkenny", "Tullamore", "Portlaoise", "Clonmel"
  ],
};

// Country configurations
const COUNTRY_CONFIGS: Record<
  string,
  {
    label: string;
    stateLabel: string;
    postalLabel: string;
    postalPlaceholder: string;
    options: Array<{ value: string; label: string }>;
  }
> = {
  "United States": {
    label: "United States",
    stateLabel: "State",
    postalLabel: "ZIP Code",
    postalPlaceholder: "89169",
    options: [
      { value: "Nevada", label: "NV" },
      { value: "California", label: "CA" },
      { value: "Texas", label: "TX" },
      { value: "New York", label: "NY" },
      { value: "Florida", label: "FL" },
    ],
  },
  "Canada": {
    label: "Canada",
    stateLabel: "Province",
    postalLabel: "Postal Code",
    postalPlaceholder: "K1A 0B1",
    options: [
      { value: "Ontario", label: "ON" },
      { value: "Quebec", label: "QC" },
      { value: "Alberta", label: "AB" },
      { value: "British Columbia", label: "BC" },
      { value: "Manitoba", label: "MB" },
      { value: "Saskatchewan", label: "SK" },
      { value: "Nova Scotia", label: "NS" },
      { value: "New Brunswick", label: "NB" },
      { value: "Prince Edward Island", label: "PE" },
      { value: "Newfoundland and Labrador", label: "NL" },
      { value: "Yukon", label: "YT" },
      { value: "Northwest Territories", label: "NT" },
      { value: "Nunavut", label: "NU" },
    ],
  },
  "United Kingdom": {
    label: "United Kingdom",
    stateLabel: "Region",
    postalLabel: "Postcode",
    postalPlaceholder: "SW1A 2AA",
    options: [
      { value: "England", label: "England" },
      { value: "Scotland", label: "Scotland" },
      { value: "Wales", label: "Wales" },
      { value: "Northern Ireland", label: "Northern Ireland" },
    ],
  },
  "Australia": {
    label: "Australia",
    stateLabel: "State",
    postalLabel: "Postcode",
    postalPlaceholder: "2000",
    options: [
      { value: "New South Wales", label: "NSW" },
      { value: "Victoria", label: "VIC" },
      { value: "Queensland", label: "QLD" },
      { value: "South Australia", label: "SA" },
      { value: "Western Australia", label: "WA" },
      { value: "Tasmania", label: "TAS" },
      { value: "Australian Capital Territory", label: "ACT" },
      { value: "Northern Territory", label: "NT" },
    ],
  },
  // Europe
  "Germany": {
    label: "Germany",
    stateLabel: "State",
    postalLabel: "Postcode",
    postalPlaceholder: "10115",
    options: [
      { value: "Baden-Württemberg", label: "BW" },
      { value: "Bavaria", label: "BY" },
      { value: "Berlin", label: "BE" },
      { value: "Brandenburg", label: "BB" },
      { value: "Bremen", label: "HB" },
      { value: "Hamburg", label: "HH" },
      { value: "Hesse", label: "HE" },
      { value: "Lower Saxony", label: "NI" },
      { value: "Mecklenburg-Vorpommern", label: "MV" },
      { value: "North Rhine-Westphalia", label: "NW" },
      { value: "Rhineland-Palatinate", label: "RP" },
      { value: "Saarland", label: "SL" },
      { value: "Saxony", label: "SN" },
      { value: "Saxony-Anhalt", label: "ST" },
      { value: "Schleswig-Holstein", label: "SH" },
      { value: "Thuringia", label: "TH" },
    ],
  },
  "France": {
    label: "France",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "75001",
    options: [
      { value: "Île-de-France", label: "IDF" },
      { value: "Provence-Alpes-Côte d'Azur", label: "PACA" },
      { value: "Auvergne-Rhône-Alpes", label: "ARA" },
      { value: "Hauts-de-France", label: "HDF" },
      { value: "Grand Est", label: "GE" },
      { value: "Bourgogne-Franche-Comté", label: "BFC" },
      { value: "Nouvelle-Aquitaine", label: "NA" },
      { value: "Occitanie", label: "OCC" },
      { value: "Pays de la Loire", label: "PDL" },
      { value: "Bretagne", label: "BRE" },
    ],
  },
  "Spain": {
    label: "Spain",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "28001",
    options: [
      { value: "Andalusia", label: "AN" },
      { value: "Aragon", label: "AR" },
      { value: "Asturias", label: "AS" },
      { value: "Balearic Islands", label: "IB" },
      { value: "Basque Country", label: "PV" },
      { value: "Canary Islands", label: "CN" },
      { value: "Cantabria", label: "CB" },
      { value: "Castile and León", label: "CL" },
      { value: "Castile-La Mancha", label: "CM" },
      { value: "Catalonia", label: "CT" },
      { value: "Extremadura", label: "EX" },
      { value: "Galicia", label: "GA" },
      { value: "Madrid", label: "MD" },
      { value: "Murcia", label: "MC" },
      { value: "Navarre", label: "NC" },
      { value: "La Rioja", label: "LR" },
      { value: "Valencia", label: "VC" },
    ],
  },
  "Italy": {
    label: "Italy",
    stateLabel: "Region",
    postalLabel: "Cap (Postal Code)",
    postalPlaceholder: "00100",
    options: [
      { value: "Abruzzo", label: "AB" },
      { value: "Aosta Valley", label: "AO" },
      { value: "Apulia", label: "BA" },
      { value: "Basilicata", label: "BZ" },
      { value: "Calabria", label: "CZ" },
      { value: "Campania", label: "NA" },
      { value: "Emilia-Romagna", label: "ER" },
      { value: "Friuli-Venezia Giulia", label: "FG" },
      { value: "Lazio", label: "RM" },
      { value: "Liguria", label: "GE" },
      { value: "Lombardy", label: "MI" },
      { value: "Marche", label: "AN" },
      { value: "Molise", label: "CB" },
      { value: "Piedmont", label: "TO" },
      { value: "Sardinia", label: "CA" },
      { value: "Sicily", label: "PA" },
      { value: "Tuscany", label: "FI" },
      { value: "Trentino-South Tyrol", label: "TN" },
      { value: "Umbria", label: "PG" },
      { value: "Veneto", label: "VE" },
    ],
  },
  "Netherlands": {
    label: "Netherlands",
    stateLabel: "Province",
    postalLabel: "Postcode",
    postalPlaceholder: "1012 AB",
    options: [
      { value: "Drenthe", label: "DR" },
      { value: "Flevoland", label: "FL" },
      { value: "Friesland", label: "FR" },
      { value: "Gelderland", label: "GD" },
      { value: "Groningen", label: "GR" },
      { value: "Limburg", label: "LB" },
      { value: "North Brabant", label: "NB" },
      { value: "North Holland", label: "NH" },
      { value: "Overijssel", label: "OV" },
      { value: "South Holland", label: "SH" },
      { value: "Utrecht", label: "UT" },
    ],
  },
  "Belgium": {
    label: "Belgium",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "1000",
    options: [
      { value: "Antwerp", label: "AN" },
      { value: "Brussels", label: "BR" },
      { value: "East Flanders", label: "EF" },
      { value: "Flemish Brabant", label: "FB" },
      { value: "Hainaut", label: "HA" },
      { value: "Liège", label: "LI" },
      { value: "Limburg", label: "LB" },
      { value: "Luxembourg", label: "LX" },
      { value: "Namur", label: "NA" },
      { value: "Walloon Brabant", label: "WB" },
      { value: "West Flanders", label: "WF" },
    ],
  },
  "Switzerland": {
    label: "Switzerland",
    stateLabel: "Canton",
    postalLabel: "Postal Code",
    postalPlaceholder: "8000",
    options: [
      { value: "Aargau", label: "AG" },
      { value: "Appenzell Ausserrhoden", label: "AR" },
      { value: "Appenzell Innerrhoden", label: "AI" },
      { value: "Basel-Landschaft", label: "BL" },
      { value: "Basel-Stadt", label: "BS" },
      { value: "Bern", label: "BE" },
      { value: "Fribourg", label: "FR" },
      { value: "Geneva", label: "GE" },
      { value: "Glarus", label: "GL" },
      { value: "Grisons", label: "GR" },
      { value: "Jura", label: "JU" },
      { value: "Luzern", label: "LU" },
      { value: "Neuchâtel", label: "NE" },
      { value: "Nidwalden", label: "NW" },
      { value: "Obwalden", label: "OW" },
      { value: "Schaffhausen", label: "SH" },
      { value: "Solothurn", label: "SO" },
      { value: "St. Gallen", label: "SG" },
      { value: "Schwyz", label: "SZ" },
      { value: "Thurgau", label: "TG" },
      { value: "Ticino", label: "TI" },
      { value: "Uri", label: "UR" },
      { value: "Valais", label: "VS" },
      { value: "Vaud", label: "VD" },
      { value: "Zug", label: "ZG" },
      { value: "Zürich", label: "ZH" },
    ],
  },
  "Austria": {
    label: "Austria",
    stateLabel: "State",
    postalLabel: "Postal Code",
    postalPlaceholder: "1010",
    options: [
      { value: "Burgenland", label: "B" },
      { value: "Carinthia", label: "K" },
      { value: "Lower Austria", label: "NÖ" },
      { value: "Salzburg", label: "S" },
      { value: "Styria", label: "ST" },
      { value: "Tyrol", label: "T" },
      { value: "Upper Austria", label: "OÖ" },
      { value: "Vienna", label: "W" },
      { value: "Vorarlberg", label: "V" },
    ],
  },
  "Portugal": {
    label: "Portugal",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "1000-001",
    options: [
      { value: "Azores", label: "AZ" },
      { value: "Alentejo", label: "AL" },
      { value: "Algarve", label: "AG" },
      { value: "Centro", label: "CE" },
      { value: "Lisbon Region", label: "LR" },
      { value: "Madeira", label: "MD" },
      { value: "North Region", label: "NO" },
    ],
  },
  "Ireland": {
    label: "Ireland",
    stateLabel: "County",
    postalLabel: "Eircode",
    postalPlaceholder: "A65 F4E6",
    options: [
      { value: "Antrim", label: "Antrim" },
      { value: "Armagh", label: "Armagh" },
      { value: "Carlow", label: "Carlow" },
      { value: "Cavan", label: "Cavan" },
      { value: "Clare", label: "Clare" },
      { value: "Cork", label: "Cork" },
      { value: "Derry", label: "Derry" },
      { value: "Donegal", label: "Donegal" },
      { value: "Down", label: "Down" },
      { value: "Dublin", label: "Dublin" },
      { value: "Fermanagh", label: "Fermanagh" },
      { value: "Galway", label: "Galway" },
      { value: "Kerry", label: "Kerry" },
      { value: "Kildare", label: "Kildare" },
      { value: "Kilkenny", label: "Kilkenny" },
      { value: "Laois", label: "Laois" },
      { value: "Leitrim", label: "Leitrim" },
      { value: "Limerick", label: "Limerick" },
      { value: "Longford", label: "Longford" },
      { value: "Louth", label: "Louth" },
      { value: "Mayo", label: "Mayo" },
      { value: "Meath", label: "Meath" },
      { value: "Monaghan", label: "Monaghan" },
      { value: "Offaly", label: "Offaly" },
      { value: "Roscommon", label: "Roscommon" },
      { value: "Sligo", label: "Sligo" },
      { value: "Tipperary", label: "Tipperary" },
      { value: "Tyrone", label: "Tyrone" },
      { value: "Waterford", label: "Waterford" },
      { value: "Westmeath", label: "Westmeath" },
      { value: "Wexford", label: "Wexford" },
      { value: "Wicklow", label: "Wicklow" },
    ],
  },
  "Denmark": {
    label: "Denmark",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "1000",
    options: [
      { value: "Capital Region", label: "CR" },
      { value: "Central Denmark", label: "CD" },
      { value: "North Denmark", label: "ND" },
      { value: "South Denmark", label: "SD" },
    ],
  },
  "Sweden": {
    label: "Sweden",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "101 20",
    options: [
      { value: "Blekinge", label: "K" },
      { value: "Dalarna", label: "W" },
      { value: "Gävleborg", label: "X" },
      { value: "Gotland", label: "I" },
      { value: "Halland", label: "N" },
      { value: "Jämtland", label: "Z" },
      { value: "Jönköping", label: "F" },
      { value: "Kalmar", label: "H" },
      { value: "Kronoberg", label: "G" },
      { value: "Norrbotten", label: "BD" },
      { value: "Östergötland", label: "E" },
      { value: "Sörmland", label: "D" },
      { value: "Stockholm", label: "AB" },
      { value: "Uppsala", label: "C" },
      { value: "Värmland", label: "S" },
      { value: "Västerbotten", label: "AC" },
      { value: "Västernorrland", label: "Y" },
      { value: "Västmanland", label: "U" },
      { value: "West Göta", label: "O" },
    ],
  },
  "Norway": {
    label: "Norway",
    stateLabel: "County",
    postalLabel: "Postal Code",
    postalPlaceholder: "0150",
    options: [
      { value: "Akershus", label: "AK" },
      { value: "Aust-Agder", label: "AA" },
      { value: "Buskerud", label: "BU" },
      { value: "Finnmark", label: "FM" },
      { value: "Hedmark", label: "HD" },
      { value: "Hordaland", label: "HO" },
      { value: "Møre og Romsdal", label: "MR" },
      { value: "Nordland", label: "NO" },
      { value: "Nord-Trøndelag", label: "NT" },
      { value: "Oppland", label: "OP" },
      { value: "Oslo", label: "OS" },
      { value: "Rogaland", label: "RO" },
      { value: "Sør-Trøndelag", label: "ST" },
      { value: "Sogn og Fjordane", label: "SF" },
      { value: "Telemark", label: "TM" },
      { value: "Troms", label: "TR" },
      { value: "Vest-Agder", label: "VA" },
      { value: "Vestfold", label: "VF" },
    ],
  },
  // Asia
  "Japan": {
    label: "Japan",
    stateLabel: "Prefecture",
    postalLabel: "Postal Code",
    postalPlaceholder: "100-0001",
    options: [
      { value: "Hokkaido", label: "北海道" },
      { value: "Aomori", label: "青森県" },
      { value: "Iwate", label: "岩手県" },
      { value: "Miyagi", label: "宮城県" },
      { value: "Akita", label: "秋田県" },
      { value: "Yamagata", label: "山形県" },
      { value: "Fukushima", label: "福島県" },
      { value: "Ibaraki", label: "茨城県" },
      { value: "Tochigi", label: "栃木県" },
      { value: "Gunma", label: "群馬県" },
      { value: "Saitama", label: "埼玉県" },
      { value: "Chiba", label: "千葉県" },
      { value: "Tokyo", label: "東京都" },
      { value: "Kanagawa", label: "神奈川県" },
      { value: "Niigata", label: "新潟県" },
      { value: "Toyama", label: "富山県" },
      { value: "Ishikawa", label: "石川県" },
      { value: "Fukui", label: "福井県" },
      { value: "Yamanashi", label: "山梨県" },
      { value: "Nagano", label: "長野県" },
      { value: "Gifu", label: "岐阜県" },
      { value: "Aichi", label: "愛知県" },
      { value: "Mie", label: "三重県" },
      { value: "Shiga", label: "滋賀県" },
      { value: "Kyoto", label: "京都府" },
      { value: "Osaka", label: "大阪府" },
      { value: "Hyogo", label: "兵庫県" },
      { value: "Nara", label: "奈良県" },
      { value: "Wakayama", label: "和歌山県" },
      { value: "Tottori", label: "鳥取県" },
      { value: "Shimane", label: "島根県" },
      { value: "Okayama", label: "岡山県" },
      { value: "Hiroshima", label: "広島県" },
      { value: "Yamaguchi", label: "山口県" },
      { value: "Tokushima", label: "徳島県" },
      { value: "Kagawa", label: "香川県" },
      { value: "Ehime", label: "愛媛県" },
      { value: "Kochi", label: "高知県" },
      { value: "Fukuoka", label: "福岡県" },
      { value: "Saga", label: "佐賀県" },
      { value: "Nagasaki", label: "長崎県" },
      { value: "Kumamoto", label: "熊本県" },
      { value: "Oita", label: "大分県" },
      { value: "Miyazaki", label: "宮崎県" },
      { value: "Kagoshima", label: "鹿児島県" },
      { value: "Okinawa", label: "沖縄県" },
    ],
  },
  "South Korea": {
    label: "South Korea",
    stateLabel: "Province",
    postalLabel: "Postal Code",
    postalPlaceholder: "03151",
    options: [
      { value: "Seoul", label: "서울" },
      { value: "Busan", label: "부산" },
      { value: "Daegu", label: "대구" },
      { value: "Incheon", label: "인천" },
      { value: "Gwangju", label: "광주" },
      { value: "Daejeon", label: "대전" },
      { value: "Ulsan", label: "울산" },
      { value: "Sejong", label: "세종" },
      { value: "Gyeonggi-do", label: "경기도" },
      { value: "Gangwon-do", label: "강원도" },
      { value: "North Chungcheong", label: "충청북도" },
      { value: "South Chungcheong", label: "충청남도" },
      { value: "North Jeolla", label: "전라북도" },
      { value: "South Jeolla", label: "전라남도" },
      { value: "North Gyeongsang", label: "경상북도" },
      { value: "South Gyeongsang", label: "경상남도" },
      { value: "Jeju", label: "제주도" },
    ],
  },
  "China": {
    label: "China",
    stateLabel: "Province",
    postalLabel: "Postal Code",
    postalPlaceholder: "100000",
    options: [
      { value: "Anhui", label: "安徽" },
      { value: "Beijing", label: "北京" },
      { value: "Chongqing", label: "重庆" },
      { value: "Fujian", label: "福建" },
      { value: "Gansu", label: "甘肃" },
      { value: "Guangdong", label: "广东" },
      { value: "Guangxi", label: "广西" },
      { value: "Guizhou", label: "贵州" },
      { value: "Hainan", label: "海南" },
      { value: "Hebei", label: "河北" },
      { value: "Heilongjiang", label: "黑龙江" },
      { value: "Henan", label: "河南" },
      { value: "Hong Kong", label: "香港" },
      { value: "Hubei", label: "湖北" },
      { value: "Hunan", label: "湖南" },
      { value: "Jiangsu", label: "江苏" },
      { value: "Jiangxi", label: "江西" },
      { value: "Jilin", label: "吉林" },
      { value: "Liaoning", label: "辽宁" },
      { value: "Macao", label: "澳门" },
      { value: "Inner Mongolia", label: "内蒙古" },
      { value: "Ningxia", label: "宁夏" },
      { value: "Qinghai", label: "青海" },
      { value: "Shaanxi", label: "陕西" },
      { value: "Shandong", label: "山东" },
      { value: "Shanghai", label: "上海" },
      { value: "Shanxi", label: "山西" },
      { value: "Sichuan", label: "四川" },
      { value: "Taiwan", label: "台湾" },
      { value: "Tianjin", label: "天津" },
      { value: "Tibet", label: "西藏" },
      { value: "Xinjiang", label: "新疆" },
      { value: "Yunnan", label: "云南" },
      { value: "Zhejiang", label: "浙江" },
    ],
  },
  "India": {
    label: "India",
    stateLabel: "State",
    postalLabel: "Postal Code",
    postalPlaceholder: "110001",
    options: [
      { value: "Andaman and Nicobar Islands", label: "AN" },
      { value: "Andhra Pradesh", label: "AP" },
      { value: "Arunachal Pradesh", label: "AR" },
      { value: "Assam", label: "AS" },
      { value: "Bihar", label: "BR" },
      { value: "Chandigarh", label: "CH" },
      { value: "Chhattisgarh", label: "CT" },
      { value: "Dadra and Nagar Haveli", label: "DD" },
      { value: "Daman and Diu", label: "DM" },
      { value: "Delhi", label: "DL" },
      { value: "Goa", label: "GA" },
      { value: "Gujarat", label: "GJ" },
      { value: "Haryana", label: "HR" },
      { value: "Himachal Pradesh", label: "HP" },
      { value: "Jharkhand", label: "JH" },
      { value: "Karnataka", label: "KA" },
      { value: "Kerala", label: "KL" },
      { value: "Ladakh", label: "LA" },
      { value: "Lakshadweep", label: "LD" },
      { value: "Madhya Pradesh", label: "MP" },
      { value: "Maharashtra", label: "MH" },
      { value: "Manipur", label: "MN" },
      { value: "Meghalaya", label: "ML" },
      { value: "Mizoram", label: "MZ" },
      { value: "Nagaland", label: "NL" },
      { value: "Odisha", label: "OD" },
      { value: "Puducherry", label: "PB" },
      { value: "Punjab", label: "PJ" },
      { value: "Rajasthan", label: "RJ" },
      { value: "Sikkim", label: "SK" },
      { value: "Tamil Nadu", label: "TN" },
      { value: "Telangana", label: "TG" },
      { value: "Tripura", label: "TR" },
      { value: "Uttar Pradesh", label: "UP" },
      { value: "Uttarakhand", label: "UK" },
      { value: "West Bengal", label: "WB" },
    ],
  },
  "Singapore": {
    label: "Singapore",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "018956",
    options: [
      { value: "Central", label: "Central" },
      { value: "East", label: "East" },
      { value: "North", label: "North" },
      { value: "Northeast", label: "Northeast" },
      { value: "West", label: "West" },
    ],
  },
  "Thailand": {
    label: "Thailand",
    stateLabel: "Province",
    postalLabel: "Postal Code",
    postalPlaceholder: "10110",
    options: [
      { value: "Bangkok", label: "Bangkok" },
      { value: "Amnat Charoen", label: "AN" },
      { value: "Yasothon", label: "YS" },
      { value: "Amnat Charoen", label: "AC" },
    ],
  },
  // Americas
  "Mexico": {
    label: "Mexico",
    stateLabel: "State",
    postalLabel: "Postal Code",
    postalPlaceholder: "06500",
    options: [
      { value: "Aguascalientes", label: "AG" },
      { value: "Baja California", label: "BC" },
      { value: "Baja California Sur", label: "BS" },
      { value: "Campeche", label: "CM" },
      { value: "Chiapas", label: "CP" },
      { value: "Chihuahua", label: "CH" },
      { value: "Coahuila", label: "CO" },
      { value: "Colima", label: "CL" },
      { value: "Mexico City", label: "MX" },
      { value: "Durango", label: "DG" },
      { value: "Guanajuato", label: "GA" },
      { value: "Guerrero", label: "GR" },
      { value: "Hidalgo", label: "HG" },
      { value: "Jalisco", label: "JC" },
      { value: "Mexico State", label: "EM" },
      { value: "Michoacán", label: "MI" },
      { value: "Morelos", label: "MO" },
      { value: "Nayarit", label: "NA" },
      { value: "Nuevo León", label: "NL" },
      { value: "Oaxaca", label: "OA" },
      { value: "Puebla", label: "PU" },
      { value: "Querétaro", label: "QT" },
      { value: "Quintana Roo", label: "QR" },
      { value: "San Luis Potosí", label: "SL" },
      { value: "Sinaloa", label: "SI" },
      { value: "Sonora", label: "SO" },
      { value: "Tabasco", label: "TB" },
      { value: "Tamaulipas", label: "TM" },
      { value: "Tlaxcala", label: "TL" },
      { value: "Veracruz", label: "VZ" },
      { value: "Yucatán", label: "YU" },
      { value: "Zacatecas", label: "ZA" },
    ],
  },
  "Brazil": {
    label: "Brazil",
    stateLabel: "State",
    postalLabel: "Postal Code",
    postalPlaceholder: "01310-100",
    options: [
      { value: "Acre", label: "AC" },
      { value: "Alagoas", label: "AL" },
      { value: "Amapá", label: "AP" },
      { value: "Amazonas", label: "AM" },
      { value: "Bahia", label: "BA" },
      { value: "Ceará", label: "CE" },
      { value: "Federal District", label: "DF" },
      { value: "Espírito Santo", label: "ES" },
      { value: "Goiás", label: "GO" },
      { value: "Maranhão", label: "MA" },
      { value: "Mato Grosso", label: "MT" },
      { value: "Mato Grosso do Sul", label: "MS" },
      { value: "Minas Gerais", label: "MG" },
      { value: "Pará", label: "PA" },
      { value: "Paraíba", label: "PB" },
      { value: "Paraná", label: "PR" },
      { value: "Pernambuco", label: "PE" },
      { value: "Piauí", label: "PI" },
      { value: "Rio de Janeiro", label: "RJ" },
      { value: "Rio Grande do Norte", label: "RN" },
      { value: "Rio Grande do Sul", label: "RS" },
      { value: "Rondônia", label: "RO" },
      { value: "Roraima", label: "RR" },
      { value: "Santa Catarina", label: "SC" },
      { value: "São Paulo", label: "SP" },
      { value: "Sergipe", label: "SE" },
      { value: "Tocantins", label: "TO" },
    ],
  },
  // Middle East & Africa
  "United Arab Emirates": {
    label: "United Arab Emirates",
    stateLabel: "Emirate",
    postalLabel: "Postal Code",
    postalPlaceholder: "12345",
    options: [
      { value: "Abu Dhabi", label: "ADA" },
      { value: "Ajman", label: "AJM" },
      { value: "Dubai", label: "DXB" },
      { value: "Fujairah", label: "FJH" },
      { value: "Ras Al Khaimah", label: "RAK" },
      { value: "Sharjah", label: "SJI" },
      { value: "Umm Al Quwain", label: "UQU" },
    ],
  },
  "Saudi Arabia": {
    label: "Saudi Arabia",
    stateLabel: "Region",
    postalLabel: "Postal Code",
    postalPlaceholder: "11111",
    options: [
      { value: "Al Madinah", label: "MD" },
      { value: "Al Qassim", label: "QA" },
      { value: "Eastern Province", label: "EP" },
      { value: "Ha'il", label: "HA" },
      { value: "Jizan", label: "JI" },
      { value: "Makkah", label: "MK" },
      { value: "Najran", label: "NR" },
      { value: "Riyadh", label: "RI" },
    ],
  },
  "South Africa": {
    label: "South Africa",
    stateLabel: "Province",
    postalLabel: "Postal Code",
    postalPlaceholder: "0001",
    options: [
      { value: "Eastern Cape", label: "EC" },
      { value: "Free State", label: "FS" },
      { value: "Gauteng", label: "GA" },
      { value: "KwaZulu-Natal", label: "KZN" },
      { value: "Limpopo", label: "LP" },
      { value: "Mpumalanga", label: "MP" },
      { value: "Northern Cape", label: "NC" },
      { value: "North West", label: "NW" },
      { value: "Western Cape", label: "WC" },
    ],
  },
  "New Zealand": {
    label: "New Zealand",
    stateLabel: "Region",
    postalLabel: "Postcode",
    postalPlaceholder: "1010",
    options: [
      { value: "Auckland", label: "AK" },
      { value: "Bay of Plenty", label: "BOP" },
      { value: "Canterbur", label: "CAN" },
      { value: "Gisborne", label: "GIS" },
      { value: "Hawke's Bay", label: "HB" },
      { value: "Manawatū", label: "MWT" },
      { value: "Marlborough", label: "MBH" },
      { value: "Nelson", label: "NSN" },
      { value: "Northland", label: "NTL" },
      { value: "Otago", label: "OTA" },
      { value: "Southland", label: "STL" },
      { value: "Taranaki", label: "TRA" },
      { value: "Tasman", label: "TSM" },
      { value: "Waikato", label: "WKT" },
      { value: "Wellington", label: "WGN" },
      { value: "West Coast", label: "WTC" },
    ],
  },
};

interface ShippingLocationData {
  country: string;
  cities: string[];
}

export default function ShippingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartData, setCartData] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [fieldWarnings, setFieldWarnings] = useState<FieldWarnings>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [storeShippingLocations, setStoreShippingLocations] = useState<ShippingLocationData[]>([]);
  const [locationsLoaded, setLocationsLoaded] = useState(false);

  const [formData, setFormData] = useState<ShippingFormData>({
    country: "",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    // Load cart data from localStorage
    const cart = localStorage.getItem("ecommerce-cart");
    if (cart) {
      const parsedCart = JSON.parse(cart);
      
      // Fetch latest stock data from server to ensure up-to-date values
      const productIds = [...new Set(parsedCart.map((item: any) => item.productId))];
      if (productIds.length > 0) {
        fetch("/api/products/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.stock) {
              // Update cart items with latest stock information
              const updatedCart = parsedCart.map((item: any) => {
                const stockInfo = data.stock[item.productId];
                if (stockInfo) {
                  // For variant items, use variant stock; otherwise use base product stock
                  const latestStock = item.variantId
                    ? stockInfo.variants[item.variantId] ?? item.stock
                    : stockInfo.baseStock ?? item.stock;
                  
                  return { ...item, stock: latestStock };
                }
                return item;
              });
              setCartData(updatedCart);
            } else {
              // If stock fetch fails, use the local data
              setCartData(parsedCart);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch latest stock data:", error);
            // Fall back to local cart data if API call fails
            setCartData(parsedCart);
          });
      } else {
        setCartData(parsedCart);
      }
    } else {
      // No cart data, redirect back to store
      router.back();
    }

    // Listen for localStorage changes to sync cart updates from other sources (e.g., cart drawer)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ecommerce-cart" && e.newValue) {
        try {
          const updatedCart = JSON.parse(e.newValue);
          setCartData(updatedCart);
        } catch (error) {
          console.error("Failed to parse updated cart data:", error);
        }
      }
    };

    // Listen for custom cart update events (same-tab/window updates)
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.items) {
        setCartData(customEvent.detail.items);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [router]);

  // Fetch latest stock data periodically while on checkout page
  useEffect(() => {
    if (!cartData || cartData.length === 0) return;

    const productIds = [...new Set(cartData.map((item: any) => item.productId))];
    if (productIds.length === 0) return;

    // Fetch immediately
    const fetchStockData = () => {
      fetch("/api/products/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.stock) {
            setCartData((prevCart: any) =>
              prevCart.map((item: any) => {
                const stockInfo = data.stock[item.productId];
                if (stockInfo) {
                  const latestStock = item.variantId
                    ? stockInfo.variants[item.variantId] ?? item.stock
                    : stockInfo.baseStock ?? item.stock;
                  return { ...item, stock: latestStock };
                }
                return item;
              })
            );
          }
        })
        .catch((error) => {
          console.error("Failed to fetch latest stock data:", error);
        });
    };

    // Poll every 3 seconds for real-time stock updates
    const interval = setInterval(fetchStockData, 3000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [cartData?.length]); // Only re-run if cart length changes

  // Fetch store shipping locations
  useEffect(() => {
    const effectiveStoreId = storeId || (cartData && cartData[0]?.storeId);
    if (!effectiveStoreId) return;

    fetch(`/api/stores/shipping-locations?storeId=${effectiveStoreId}`)
      .then((res) => res.json())
      .then((data) => {
        const locations: ShippingLocationData[] = data.locations || [];
        setStoreShippingLocations(locations);
        setLocationsLoaded(true);

        // Set default country
        if (locations.length > 0 && !formData.country) {
          setFormData((prev) => ({
            ...prev,
            country: locations[0].country,
          }));
        } else if (locations.length === 0 && !formData.country) {
          // No restrictions - default to first COUNTRY_CONFIGS entry
          const firstCountry = Object.keys(COUNTRY_CONFIGS)[0] || "United States";
          setFormData((prev) => ({
            ...prev,
            country: firstCountry,
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch shipping locations:", err);
        setLocationsLoaded(true);
        if (!formData.country) {
          setFormData((prev) => ({ ...prev, country: "United States" }));
        }
      });
  }, [storeId, cartData]);

  // Get available countries (from store locations if set, else all)
  const availableCountries = storeShippingLocations.length > 0
    ? storeShippingLocations.map((loc) => loc.country)
    : Object.keys(COUNTRY_CONFIGS);

  // Load cities for selected country
  useEffect(() => {
    try {
      // First check if the store has specific cities for this country
      const storeLocation = storeShippingLocations.find(
        (loc) => loc.country === formData.country
      );
      if (storeLocation && storeLocation.cities.length > 0) {
        setAvailableCities(storeLocation.cities);
      } else {
        // Fall back to the built-in cities list
        const cities = CITIES_BY_COUNTRY[formData.country] || [];
        setAvailableCities(cities);
      }
      setCitySuggestions([]);
    } catch (err) {
      console.error("Error loading cities:", err);
      setAvailableCities([]);
    }
  }, [formData.country, storeShippingLocations]);

  const validateField = (fieldName: string, value: string) => {
    const validation = validateAddressField(
      fieldName,
      value,
      fieldName === "zipCode" ? formData.state : undefined,
      formData.country
    );
    
    if (!validation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: validation.error || null,
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  const handleCityInputChange = (value: string) => {
    // Update form data
    setFormData((prev) => ({
      ...prev,
      city: value,
    }));

    // Filter cities based on input
    if (value.trim() === "") {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    } else {
      const filtered = availableCities
        .filter((city) =>
          city.toLowerCase().startsWith(value.toLowerCase())
        )
        .slice(0, 5); // Show max 5 suggestions

      setCitySuggestions(filtered);
      setShowCitySuggestions(filtered.length > 0);
    }

    // Validate on change if field was touched
    if (touchedFields.has("city")) {
      validateField("city", value);
    }
  };

  const selectCity = (cityName: string) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
    setCitySuggestions([]);
    setShowCitySuggestions(false);

    // Validate the selected city
    validateField("city", cityName);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for country change
    if (name === "country") {
      setFormData({
        ...formData,
        country: value,
        state: "",
        zipCode: "", // Clear postal code when country changes
        city: "", // Clear city when country changes
      });
      
      // Clear suggestions and other state
      setCitySuggestions([]);
      setShowCitySuggestions(false);

      // Clear field errors and warnings when country changes
      setFieldErrors({});
      setFieldWarnings({});
      setTouchedFields(new Set());
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Only validate if field has been touched
      if (touchedFields.has(name)) {
        validateField(name, value);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields((prev) => new Set([...prev, name]));

    // Validate on blur
    validateField(name, value);

    // Check for warnings after validation (ZIP code to state alignment)
    if (name === "zipCode" || name === "state") {
      const zipCode = name === "zipCode" ? value : formData.zipCode;
      const state = name === "state" ? value : formData.state;
      const city = formData.city;

      if (zipCode && state) {
        const validation = validateAddressField("zipCode", zipCode, state);
        if (!validation.isValid && validation.error) {
          // This is an error, already set above
        }
      }
    }
  };

  const isFieldInvalid = (fieldName: string): boolean => {
    return touchedFields.has(fieldName) && !!fieldErrors[fieldName];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cartData || cartData.length === 0) {
      setError("Cart is empty");
      return;
    }

    // Validate country against store shipping locations
    if (storeShippingLocations.length > 0) {
      const allowedCountries = storeShippingLocations.map((loc) => loc.country);
      if (!allowedCountries.includes(formData.country)) {
        setError(`We do not ship to ${formData.country}. Available countries: ${allowedCountries.join(", ")}`);
        return;
      }

      // Validate city if the store has specific cities for this country
      const storeLocation = storeShippingLocations.find((loc) => loc.country === formData.country);
      if (storeLocation && storeLocation.cities.length > 0 && formData.city.trim()) {
        const cityMatch = storeLocation.cities.some(
          (c) => c.toLowerCase() === formData.city.trim().toLowerCase()
        );
        if (!cityMatch) {
          setFieldErrors((prev) => ({
            ...prev,
            city: `We do not ship to "${formData.city}" in ${formData.country}. Available cities: ${storeLocation.cities.join(", ")}`,
          }));
          setTouchedFields((prev) => new Set([...prev, "city"]));
          setError("The selected city is not available for shipping");
          return;
        }
      }
    }

    // Mark all fields as touched for validation display
    const allFields = ["firstName", "lastName", "address", "city", "state", "phone"];
    setTouchedFields(new Set(allFields));

    // Perform comprehensive validation (without postal code)
    const errors: string[] = [];
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (formData.address.trim() && formData.address.trim().length < 5) errors.push("Address must be at least 5 characters long");
    if (!formData.city.trim()) errors.push("City is required");
    if (!formData.state.trim()) errors.push("State is required");
    if (!formData.phone.trim()) errors.push("Phone number is required");
    if (formData.phone.trim() && !isValidPhoneNumber(formData.phone)) errors.push("Phone number format is invalid");

    if (errors.length > 0) {
      // Set field errors for display
      const newErrors: FieldErrors = {};
      errors.forEach((error) => {
        if (error.toLowerCase().includes("first name")) newErrors.firstName = error;
        else if (error.toLowerCase().includes("last name")) newErrors.lastName = error;
        else if (error.toLowerCase().includes("address")) newErrors.address = error;
        else if (error.toLowerCase().includes("city")) newErrors.city = error;
        else if (error.toLowerCase().includes("state")) newErrors.state = error;
        else if (error.toLowerCase().includes("phone")) newErrors.phone = error;
      });
      setFieldErrors(newErrors);
      setError("Please fix the errors below before continuing");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      storeId: storeId || cartData[0].storeId,
      items: cartData.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
      })),
      shippingInfo: formData,
    };

    console.log("Sending checkout request with payload:", payload);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Clear cart and redirect to Stripe
        localStorage.removeItem("ecommerce-cart");
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Checkout failed");
      setIsSubmitting(false);
    }
  };

  if (!cartData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Loading shipping information...</p>
        </div>
      </div>
    );
  }

  const cartTotal = cartData.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen gradient-section py-12 px-6 sm:py-16">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm">Back to Store</span>
          </button>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your delivery information to proceed with payment</p>
          <div className="accent-line w-16 mt-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="lg:order-1">
            <div className="checkout-card-themed">
              <div className="checkout-header px-6 py-5">
                <h2 className="text-overline !text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} style={{ color: "var(--primary)" }} />
                  Delivery Information
                </h2>
              </div>

              {error && (
                <div className="mx-6 mt-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Country/Region */}
                <div>
                  <label htmlFor="country" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Country/Region
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                    required
                  >
                    {availableCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* First name & Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      First name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 bg-background border text-sm text-foreground focus:outline-none transition-colors duration-200 ${
                          isFieldInvalid("firstName")
                            ? "border-red-400"
                            : "border-border focus:border-foreground"
                        }`}
                        required
                      />
                    </div>
                    {isFieldInvalid("firstName") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      Last name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 bg-background border text-sm text-foreground focus:outline-none transition-colors duration-200 ${
                          isFieldInvalid("lastName")
                            ? "border-red-400"
                            : "border-border focus:border-foreground"
                        }`}
                        required
                      />
                    </div>
                    {isFieldInvalid("lastName") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company (optional) */}
                <div>
                  <label htmlFor="company" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Company <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="3680 Howard Hughes Parkway"
                    className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                      isFieldInvalid("address")
                        ? "border-red-400"
                        : "border-border focus:border-foreground"
                    }`}
                    required
                  />
                  {isFieldInvalid("address") && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.address}
                    </p>
                  )}
                  {!isFieldInvalid("address") && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Add a house number if you have one
                    </p>
                  )}
                </div>

                {/* Apartment, suite, etc. (optional) */}
                <div>
                  <label htmlFor="apartment" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Apartment, suite, etc. <span>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                  />
                </div>

                {/* City, State, ZIP code */}
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-6 sm:col-span-2 relative">
                    <label htmlFor="city" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        autoComplete="off"
                        value={formData.city}
                        onChange={(e) => handleCityInputChange(e.target.value)}
                        onBlur={(e) => {
                          setTouchedFields((prev) => new Set([...prev, "city"]));
                          validateField("city", formData.city);
                          // Delay closing suggestions to allow click
                          setTimeout(() => setShowCitySuggestions(false), 200);
                        }}
                        onFocus={() => {
                          if (citySuggestions.length > 0) {
                            setShowCitySuggestions(true);
                          }
                        }}
                        placeholder="Las Vegas"
                        className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                          isFieldInvalid("city")
                            ? "border-red-400"
                            : "border-border focus:border-foreground"
                        }`}
                        required
                      />
                      
                      {/* City suggestions dropdown */}
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border border-border shadow-lg">
                          {citySuggestions.map((city, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectCity(city)}
                              onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing on click
                              className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-150 border-b border-border last:border-b-0"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {isFieldInvalid("city") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.city}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label htmlFor="state" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      State / Region
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. California"
                      className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                        isFieldInvalid("state")
                          ? "border-red-400"
                          : "border-border focus:border-foreground"
                      }`}
                      required
                    />
                    {isFieldInvalid("state") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.state}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label htmlFor="zipCode" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                      isFieldInvalid("phone")
                        ? "border-red-400"
                        : "border-border focus:border-foreground"
                    }`}
                    required
                  />
                  {isFieldInvalid("phone") && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-luxury btn-primary-luxury disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                        Processing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:order-2">
            <div className="checkout-card-themed sticky top-8">
              <div className="checkout-header px-6 py-5">
                <h2 className="text-overline !text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" strokeWidth={1.5} style={{ color: "var(--primary)" }} />
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-0 divide-y divide-border mb-6">
                  {cartData.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 py-4 first:pt-0">
                      {item.imageUrl && (
                        <div className="relative w-14 h-[4.5rem] overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-foreground truncate">{item.name}</h3>
                        {item.variantInfo && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variantInfo}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at next step</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-border">
                    <span className="text-overline">Total</span>
                    <span className="text-lg font-serif tracking-tight text-foreground">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 border bg-primary-light border-primary-light rounded-xl">
                  <div className="flex items-start gap-3">
                    <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-0.5">Secure Checkout</p>
                      <p>Your payment information is encrypted and secure.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
