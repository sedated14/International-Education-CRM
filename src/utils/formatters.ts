
export const getCountryCode = (country: string): string => {
    if (!country) return 'XX';

    const map: Record<string, string> = {
        "United States": "US", "United States of America": "US", "USA": "US",
        "United Kingdom": "UK", "Great Britain": "UK",
        "China": "CN",
        "Japan": "JP",
        "Germany": "DE",
        "France": "FR",
        "Italy": "IT",
        "Spain": "ES",
        "Brazil": "BR",
        "India": "IN",
        "Canada": "CA",
        "Australia": "AU",
        "Russia": "RU",
        "South Korea": "KR", "Korea": "KR",
        "Mexico": "MX",
        "Vietnam": "VN",
        "Thailand": "TH",
        "Turkey": "TR",
        "Ukraine": "UA"
        // Add more common ones as needed
    };

    if (map[country]) return map[country];

    // Fallback: First 2 letters, uppercase
    return country.substring(0, 2).toUpperCase();
};

export const getRegionCode = (region: string): string => {
    if (!region) return 'XX';

    const map: Record<string, string> = {
        "North America": "NA",
        "South America": "SA", "Latin America": "LA",
        "Europe": "EU",
        "Asia": "AS",
        "Africa": "AF",
        "Middle East": "ME",
        "Oceania": "OC",
        "Central America": "CA",
        "Caribbean": "CB"
    };

    if (map[region]) return map[region];

    // Fallback: First 2 letters, uppercase
    return region.substring(0, 2).toUpperCase();
};

export const generateAgencyCode = (index: number, name: string, country: string, region: string): string => {
    const num = String(index).padStart(4, '0');
    const nameCode = name ? name.substring(0, 3).charAt(0).toUpperCase() + name.substring(1, 3) : 'XXX'; // First 3 chars, Title case first char? User said "first 3 letters".
    // User said "0001-Acm-US-NA". "Acm" implies title case or just first 3 chars. 
    // Let's preserve case or stick to Title case for readability? Result: "Acm". 
    // If input is "ACME", output "ACM". If "acme", "acm". 
    // Example: "Acm". Let's do Title Case for the Name part to match user example logic (Acm).

    const cleanName = name.replace(/[^a-zA-Z]/g, '');
    const namePart = cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();

    const countryCode = getCountryCode(country);
    const regionCode = getRegionCode(region);

    return `${num}-${formattedName}-${countryCode}-${regionCode}`;
};
