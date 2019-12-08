import { mount } from 'enzyme'
import React from 'react'
import GooglePlacesTypeahead from '../src/index'

describe('<GooglePlacesTypeahead />', () => {
    test('render', () => {
        mount(<GooglePlacesTypeahead />)
    })
})
