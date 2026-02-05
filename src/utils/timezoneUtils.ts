export const getTimezoneForLocation = (country: string, city?: string): string => {
    const c = country.toLowerCase().trim();
    const ci = city ? city.toLowerCase().trim() : '';

    // Specialized City Mappings (for large countries)
    if (c === 'australia' || c === 'au') {
        if (ci.includes('perth')) return 'Australia/Perth';
        if (ci.includes('adelaide')) return 'Australia/Adelaide';
        if (ci.includes('brisbane')) return 'Australia/Brisbane';
        if (ci.includes('darwin')) return 'Australia/Darwin';
        // Default to Sydney/Melbourne (most common)
        return 'Australia/Sydney';
    }

    if (c === 'united states' || c === 'usa' || c === 'us') {
        if (ci.includes('new york') || ci.includes('york')) return 'America/New_York';
        if (ci.includes('los angeles') || ci.includes('angeles') || ci.includes('california')) return 'America/Los_Angeles';
        if (ci.includes('chicago')) return 'America/Chicago';
        // Default? User said "most used". Eastern Time is likely most populated or business centric?
        return 'America/New_York';
    }

    if (c === 'canada' || c === 'ca') {
        if (ci.includes('vancouver')) return 'America/Vancouver';
        if (ci.includes('toronto')) return 'America/Toronto';
        return 'America/Toronto';
    }

    if (c === 'china' || c === 'cn') return 'Asia/Shanghai';

    // Country Defaults
    const defaults: { [key: string]: string } = {
        'united kingdom': 'Europe/London',
        'uk': 'Europe/London',
        'great britain': 'Europe/London',
        'england': 'Europe/London',
        'ireland': 'Europe/Dublin',
        'france': 'Europe/Paris',
        'germany': 'Europe/Berlin',
        'spain': 'Europe/Madrid',
        'italy': 'Europe/Rome',
        'netherlands': 'Europe/Amsterdam',
        'switzerland': 'Europe/Zurich',
        'turkey': 'Europe/Istanbul',
        'india': 'Asia/Kolkata',
        'japan': 'Asia/Tokyo',
        'south korea': 'Asia/Seoul',
        'korea': 'Asia/Seoul',
        'singapore': 'Asia/Singapore',
        'thailand': 'Asia/Bangkok',
        'vietnam': 'Asia/Ho_Chi_Minh',
        'indonesia': 'Asia/Jakarta',
        'malaysia': 'Asia/Kuala_Lumpur',
        'philippines': 'Asia/Manila',
        'hong kong': 'Asia/Hong_Kong',
        'taiwan': 'Asia/Taipei',
        'uae': 'Asia/Dubai',
        'united arab emirates': 'Asia/Dubai',
        'saudi arabia': 'Asia/Riyadh',
        'brazil': 'America/Sao_Paulo',
        'mexico': 'America/Mexico_City',
        'argentina': 'America/Argentina/Buenos_Aires',
        'colombia': 'America/Bogota',
        'chile': 'America/Santiago',
        'peru': 'America/Lima',
        'south africa': 'Africa/Johannesburg',
        'nigeria': 'Africa/Lagos',
        'egypt': 'Africa/Cairo',
        'kenya': 'Africa/Nairobi',
        'new zealand': 'Pacific/Auckland',
        'nz': 'Pacific/Auckland'
    };

    return defaults[c] || 'UTC'; // Default fallback
};
