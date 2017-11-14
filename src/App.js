import React, { Component } from 'react';
import './App.css';
import InteractiveJsonDocument from './InteractiveJsonDocument';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: null,
            example: null
        };
        Promise.all([
            fetch(`${process.env.PUBLIC_URL}/package-json-schema.json`),
            fetch(`${process.env.PUBLIC_URL}/package-json-example.json`),
        ])
            .then(rs => Promise.all(rs.map(r => r.json())))
            .then(([schema, example]) => this.setState({ schema, example }));
    }

    render() {
        const { schema, example } = this.state;
        let content = '';
        if (example) {
            content = (<InteractiveJsonDocument
                json={example}
            />);
        }
        return (
            <div className="App">
                {content}
            </div>
        );
    }
}

export default App;
