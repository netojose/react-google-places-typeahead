export function debounceEvent(callback, time, interval) {
    return (...args) =>
        clearTimeout(interval, (interval = setTimeout(callback, time, ...args)))
}

export function getActiveSuggestionId(itemId) {
    return itemId ? `PlacesTypeahead__suggestion-${itemId}` : null
}

export function formatPrediction(item) {
    return {
        id: item.id,
        description: item.description,
        placeId: item.place_id,
        formattedSuggestion: {
            mainText: item.structured_formatting.main_text,
            secondaryText: item.structured_formatting.secondary_text
        },
        matchedSubstrings: item.matched_substrings,
        terms: item.terms,
        types: item.types
    }
}
