import React from 'react';
import './InteractiveJsonDocument.css';
import InteractiveJsonKeyValue from './InteractiveJsonKeyValue';

const CURLY_OPEN = `{`;
const CURLY_CLOSE = `}`;

class InteractiveJsonDocument extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { json } = this.props;
        return (<pre>
            <span>{CURLY_OPEN}</span>
            {Object.keys(json).map((property, index, arr) => {
                return (<InteractiveJsonKeyValue
                    property={property}
                    value={json[property]}
                    indentSize={4}
                    key={property}
                    drawTrailingComma={index < arr.length-1}
                />);
            })}
            <span>{CURLY_CLOSE}</span>
        </pre>);
    }
}

export default InteractiveJsonDocument;
