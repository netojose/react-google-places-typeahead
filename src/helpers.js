export function debounceEvent(callback, time) {
    let interval
    return (...args) => {
        clearTimeout(interval)
        interval = setTimeout(() => {
            interval = null
            callback(...args)
        }, time)
    }
}

export function getActiveSuggestionId(itemId) {
    return itemId ? `PlacesTypeahead__suggestion-${itemId}` : null
}

export function formatPrediction({
    place_id: placeId,
    matched_substrings: matchedSubstrings,
    structured_formatting: {
        main_text: mainText,
        secondary_text: secondaryText
    },
    ...props
}) {
    return {
        ...props,
        placeId,
        matchedSubstrings,
        formattedSuggestion: {
            mainText,
            secondaryText
        }
    }
}
