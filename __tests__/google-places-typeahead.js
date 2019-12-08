import { mount } from 'enzyme'
import React from 'react'
import GooglePlacesTypeahead from '../src/index'
import { JestEnvironment } from '@jest/environment'

describe('<GooglePlacesTypeahead />', () => {
    test('render', () => {
        const serviceMock = jest.fn()
        global.google = {
            maps: {
                places: {
                    AutocompleteService: serviceMock
                }
            }
        }
        mount(
            <GooglePlacesTypeahead value='' onChange={() => null}>
                {() => null}
            </GooglePlacesTypeahead>
        )
        expect(serviceMock).toBeCalled()
    })
})
