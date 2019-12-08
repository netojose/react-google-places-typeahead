import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import {
    debounceEvent,
    getActiveSuggestionId,
    formatPrediction
} from './helpers'

const KEY_UP_CODE = 38
const KEY_DOWN_CODE = 40
const KEY_ENTER_CODE = 13
const KEY_ESC_CODE = 27

function GooglePlacesTypeahead({
    children,
    gMapsCallback,
    onSelect,
    onError,
    debounce,
    value,
    onChange,
    searchOptions
}) {
    const [isReady, setIsReady] = useState(false)
    const [fetchedData, setFetchedData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeSuggestion, setActiveSuggestion] = useState(null)
    const googleService = useRef(null)

    const loadSuggestions = useCallback((predictions, status) => {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
            onError(status)
            return
        }
        setIsLoading(false)
        setFetchedData(predictions.map(formatPrediction))
        if (predictions && predictions.length > 0) {
            setActiveSuggestion(predictions[0].place_id)
        }
    }, [])

    const init = useCallback(() => {
        if (!window.google) {
            throw new Error(
                '[react-google-places-typeahead]: Google maps API not laoded'
            )
            return
        }
        googleService.current = new window.google.maps.places.AutocompleteService()
        setIsReady(true)
    }, [])

    useEffect(() => {
        if (gMapsCallback && !window.google) {
            window[gMapsCallback] = init
            return
        }
        init()
    }, [])

    const suggestions = useMemo(
        () =>
            fetchedData.map(place => ({
                active: activeSuggestion === place.placeId,
                ...place
            })),
        [activeSuggestion, fetchedData]
    )

    const doSearch = useMemo(
        () =>
            debounceEvent(value => {
                if (!value) {
                    removeSuggestions()
                    return
                }
                setIsLoading(true)
                googleService.current.getQueryPredictions(
                    { ...searchOptions, input: value },
                    loadSuggestions
                )
            }, debounce),
        [searchOptions]
    )

    const removeSuggestions = useCallback(() => {
        setFetchedData([])
        setActiveSuggestion(null)
    }, [])

    useEffect(() => {
        if (suggestions.length > 0) {
            document.addEventListener('click', removeSuggestions)
            return
        }
        document.removeEventListener('click', removeSuggestions)
    }, [suggestions])

    useEffect(
        () => () => document.removeEventListener('click', removeSuggestions),
        []
    )

    const handleChange = useCallback(
        evt => {
            onChange(evt.target.value)
            if (!googleService.current) {
                return
            }
            doSearch(evt.target.value)
        },
        [googleService.current]
    )

    const handleSelect = useCallback(item => {
        removeSuggestions()
        onChange(item.description)
        onSelect(item)
    }, [])

    const handleKeyboardNavigation = useCallback(
        evt => {
            if (
                (evt.keyCode !== KEY_UP_CODE &&
                    evt.keyCode !== KEY_DOWN_CODE &&
                    evt.keyCode !== KEY_ENTER_CODE &&
                    evt.keyCode !== KEY_ESC_CODE) ||
                suggestions.length < 1
            ) {
                return
            }

            evt.preventDefault()

            if (evt.keyCode === KEY_ESC_CODE) {
                removeSuggestions()
                return
            }

            if (evt.keyCode === KEY_ENTER_CODE) {
                handleSelect(suggestions.find(suggestion => suggestion.active))
                return
            }

            const activeIndex = suggestions.findIndex(
                suggestion => suggestion.active
            )
            let newIndex =
                activeIndex +
                { [KEY_UP_CODE]: -1, [KEY_DOWN_CODE]: 1 }[evt.keyCode]
            if (newIndex < 0) {
                newIndex = suggestions.length - 1
            } else if (newIndex >= suggestions.length) {
                newIndex = 0
            }
            setActiveSuggestion(suggestions[newIndex].placeId)
        },
        [suggestions]
    )

    const getInputProps = useCallback(
        (props = {}) => {
            const currSuggestionId = getActiveSuggestionId(activeSuggestion)
            const {
                value: valueProp,
                onChange,
                onKeyDown,
                ...extraProps
            } = props

            if (valueProp) {
                throw new Error(
                    '[react-google-places-typeahead]: getInputProps does not accept `value`. Use `value` prop instead'
                )
            }

            if (onChange) {
                throw new Error(
                    '[react-google-places-typeahead]: getInputProps does not accept `onChange`. Use `onChange` prop instead'
                )
            }

            return {
                ...extraProps,
                role: 'combobox',
                'aria-autocomplete': 'list',
                'aria-expanded': suggestions.length > 1,
                'aria-activedescendant': currSuggestionId,
                value,
                disabled: !isReady,
                onChange: handleChange,
                onKeyDown: evt => {
                    handleKeyboardNavigation(evt)
                    onKeyDown && onKeyDown(evt)
                }
            }
        },
        [
            value,
            handleKeyboardNavigation,
            suggestions,
            isReady,
            activeSuggestion
        ]
    )

    const getSuggestionItemProps = useCallback((item, props = {}) => {
        const { onClick, onMouseOver, ...extraProps } = props
        return {
            ...extraProps,
            key: item.id,
            id: getActiveSuggestionId(item.placeId),
            onClick: evt => {
                handleSelect(item)
                onClick && onClick(evt)
            },
            onMouseOver: evt => {
                setActiveSuggestion(item.placeId)
                onMouseOver && onMouseOver(evt)
            }
        }
    }, [])

    return children({
        suggestions,
        isLoading,
        getInputProps,
        getSuggestionItemProps
    })
}

GooglePlacesTypeahead.displayName = 'GooglePlacesTypeahead'

GooglePlacesTypeahead.defaultProps = {
    onSelect: () => null,
    onError: () => null,
    gMapsCallback: null,
    debounce: 200,
    searchOptions: {}
}

GooglePlacesTypeahead.propTypes = {
    children: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func,
    gMapsCallback: PropTypes.string,
    onSelect: PropTypes.func,
    debounce: PropTypes.number,
    searchOptions: PropTypes.shape({
        bounds: PropTypes.object,
        componentRestrictions: PropTypes.object,
        location: PropTypes.object,
        offset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        types: PropTypes.array
    })
}

export default GooglePlacesTypeahead

export { geocodeByPlaceId } from './utils'
export { geocodeByAddress } from './utils'
export { getLatLng } from './utils'
export { loadScript } from './utils'
