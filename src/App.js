import React, { Component } from 'react'
import CollapsibleObject from 'CollapsibleObject'
import data from './data'
// import data from './data/graphql-schema'

export default class App extends Component {
    render() {
        return (
            <div className="container">
                {data.map((obj, i) => (
                    <CollapsibleObject key={i} obj={obj} open={true} />
                ))}
            </div>
        )
    }
}
