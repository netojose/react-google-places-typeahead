function getGeocode(query) {
    const geocoder = new window.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
        geocoder.geocode(query, (results, status) => {
            if (status !== window.google.maps.GeocoderStatus.OK) {
                reject(status)
            }
            resolve(results)
        })
    })
}

export function geocodeByPlaceId(placeId) {
    return getGeocode({ placeId })
}

export function geocodeByAddress(address) {
    return getGeocode({ address })
}

export function getLatLng(result) {
    return new Promise((resolve, reject) => {
        try {
            const latLng = {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
            }
            resolve(latLng)
        } catch (e) {
            reject(e)
        }
    })
}

export function loadScript(
    apiKey,
    callbackFn = null,
    id = 'google-places-script'
) {
    const script = document.querySelector(`#${id}`)
    if (script) {
        return
    }

    const scriptTag = document.createElement('script')
    scriptTag.setAttribute(
        'src',
        `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places${
            callbackFn ? `&callback=${callbackFn}` : ''
        }`
    )
    scriptTag.setAttribute('id', id)
    document.head.appendChild(scriptTag)
}
